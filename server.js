import express from 'express';
import cors from 'cors';

import axios from 'axios';
import { MongoClient } from 'mongodb';
import nodeXlsx from 'node-xlsx';
import merge from 'easy-pdf-merge';

import fs from 'fs';
import nodemailer from 'nodemailer';

import Parsers from './parsers.js';
import MongoDriver from './mongo-driver';
import {
  fieldsDirectories, s3Params, getSignedUrl, 
  createResponseFromValue, asyncAPIDriver, getObject, 
  getFullFields, getResponseAndClient, handleMongo, 
  handleExclusions, stripDirFromPath, getAnswerByRef,
  getSectorByActivity, deleteOldestFile, sendChartEmail,
  prepareEmail, capitalize, displayAnswers, parseAnswers
} from './utils';
import { UserRoutes, ExcelRoutes } from './routes';
import { fail } from './errors';

import dotenv from 'dotenv';
import PDF from './pdf';

import Iterator from './soap/iterator';
import { productIDMap } from './soap/helpers';

dotenv.config();

const { 
  MONGODB_URI, PORT, 
  TYPEFORM_API, AUTH_TOKEN,
  DB_NAME,
  EMAIL, EMAIL_PASS, EMAIL_RECEIVER, EMAIL_RECEIVER_CHART,
  TAX_VALUE,
} = process.env;

const mongoClient = new MongoClient(
  MONGODB_URI, 
  { useUnifiedTopology: true }
);

const loadConfig = async (formID) => {
  const configCollection = await mongoClient.db(DB_NAME).collection('config');
  
  const xlsxConfig = undefined === formID ? 
    await configCollection.find().toArray() : 
    await configCollection.findOne({ formID });

  return xlsxConfig;
}

const loadCompanies = async () => {
  const companyCollection = await mongoClient.db(DB_NAME).collection('companies');

  return companyCollection.find().toArray()
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(cors());
app.use(express.static('public'))


app.use('/', (req, res, next) => {
  // middleware
  const { method, url } = req;

  console.log(`[${method.toUpperCase()}] ${url} :`, req.params, req.body);
  try {
    next();
  } catch (e) { // segun https://expressjs.com/en/guide/error-handling.html esto no haría falta
    res.status(500).json({ error: e })
  }
})

app.get('/config', async (req, res) => {
  try {
    const config = await loadConfig();
    res.send(config);
  } catch (e) {
    console.log(e);
    res.sendStatus = 500;
    res.send(e);
  }
})

app.get('/companies', async (req, res) => {
  try {
    const config = await loadCompanies();
    res.send(config);
  } catch (e) {
    console.log(e);
    res.sendStatus = 500;
    res.send(e);
  }
})

app.post('/config', async (req, res) => {
  const {
    formLabel,
    formID,
    xlsx,
    excelParser,
    answerParser,
    productName,
    exclusions,
    cover,
  } = req.body;

  const companies = Object.keys(xlsx);

  const result = await (await MongoDriver(mongoClient, 'config'))
    .insert({
      formLabel,
      formID,
      xlsx,
      excelParser,
      answerParser,
      companies,
      exclusions,
      productName,
      cover,
      last_uploaded_at: Date.now(),
    });
  
  try {
    res.send({ success: result, errors: [] });
  } catch (e) {
    console.log(e);
    res.sendStatus = 500;
    res.send({ success: false, errors: [ e ] });
  }
})

app.get('/form/:id', (req, res) => {
  const { id } = req.params;

  axios.get(`${TYPEFORM_API}/${id}`, {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`
    }
  })
    .then(({data}) => {
      res.json(data)
    })
    .catch(err => {
      res.send(err)
    })
})

app.get('/parsers', async (req, res) => {
  res.send(Parsers);
});

app.post('/getUrlS3', async (req, res) => {
  const { type, name } = req.body;

  const result = await getSignedUrl('putObject', s3Params, name, type);

  res.json(result);
})

ExcelRoutes(app, mongoClient, loadConfig);

app.post('/pdf', async (req, res) => {
  const { email, company, form, answers } = req.body;
  const [ generalData ] = answers;
  const config = await loadConfig(form);
  const { sectors, internal_id } = config;
  let filename = null;
  let sectorPDF = null;
  let mergeWithInfo = true;

  try {
    const pdfResult = await PDF(req.body, internal_id);
    filename = pdfResult.filename;
  } catch (e) {
    return fail(res, mongoClient, { email, form, message: `Fallo en generador de PDF: ${e}` })
  }
  const resultName = `public/result-${internal_id}-${company}-${email}.pdf`.toLowerCase().replace(/\s/gu, '');
  const dir = 'public/';
  
  try {
    deleteOldestFile();
    const infoFileName = `./pdf/bases/info-${internal_id}-${company}.pdf`.toLowerCase();
    if (filename === null) {
      return fail(res, mongoClient, { email, form, message: 'Fallo en generador de PDF.' })
    } else if (!fs.existsSync(infoFileName)) {
      mergeWithInfo = false;
    }    

    if (sectors && Array.isArray(sectors) && sectors.includes(company)) {
      const sectorData = await (await MongoDriver(mongoClient, 'sectors')).findAll();
      const activity = getAnswerByRef('activity', generalData);
      const sectorToInclude = getSectorByActivity(sectorData, activity);
      const { pdf } = sectorToInclude;
      sectorPDF = `./pdf/sectors/${pdf}`;
    }
    // sectores antes de merge info adicional
    // en config debe haber un campo sectors (que solo estará a true en rcp de momento)
    // si sectors -> leemos db de sectores y hacemos un find por item en activity
    //   found -> añadimos los sectores que toquen (merge) y mergeamos el resultado final
    //   not found -> throw
    if (sectorPDF !== null) {
      const withSectorsName = mergeWithInfo ?
        'tmp/with-sectors.pdf' :
        resultName;

      await merge([filename, sectorPDF], withSectorsName, (mergeError) => {
        if (mergeError) {
          throw (mergeError);
        }
      })
      filename = withSectorsName;
    }
    if (mergeWithInfo) {
      return merge([filename, infoFileName], resultName, (mergeError) => {
        if (mergeError) {
          throw (mergeError);
        }
        const urlName = stripDirFromPath(resultName, dir);
        return res.send({ filename: urlName });
      })
    }

    return res.send({ filename: stripDirFromPath(filename, dir) });
  } catch (e) {
    return fail(res, mongoClient, {
      message: `PDF Merger encountered an error: ${e}`,
      email,
      form
    });
  }
});

app.post('/calculate', async (req, res) => {
  const { form, email } = req.body;
  try {
    const config = await loadConfig(form);
    // Params and config control
    if (null === config) {
      return fail(res, mongoClient, {
        message: `ERROR: Form ID ${form} not recognized.`,
        email,
        form 
      });
    }

    const { answerParser, excelParser, xlsx, cover, exclusions } = config;  

    const result = await getResponseAndClient(form, email);

    if (null === result) {
      return fail(res, mongoClient, {
        message: `ERROR: Combinación de formulario ${form} y email ${email} no encontrada en Typeform.`,
        email,
        form
      })
    } 
  
    const { data, name } = result;
    if (data) {
      const [ { answers, submitted_at } ] = data.items; // most recent answers by this email
      const stringAnswers = JSON.stringify(answers);
      const exclusionKeys = Object.keys(exclusions);
      const excludedController = {};
      for (const key of exclusionKeys) {
        // get exclusion excel from s3 
        excludedController[key] = false;
        const result = await getObject({ ...s3Params, Key: `excels/exclusions/${exclusions[key]}` });
    
        if (result.Body) {
          const parsedExclusion = nodeXlsx.parse(result.Body);
          const exclusionData = parsedExclusion[0].data;
          const rules = exclusionData.splice(1); // row 0 is always the title
          excludedController[key] = handleExclusions(rules, answers);
        }
      }
      
      // Get non excluded companies
      const companiesToCalculate = exclusionKeys.filter((key) => !excludedController[key]);
      const valueReferences = {};
      const valueForCompanies = {};
      const indemnizationValues = {};
  
      if (companiesToCalculate.length > 0) { // all excluded
        for (const companyName of companiesToCalculate) {
          valueForCompanies[companyName] = null;
          // get the corresponding excel for the company
          const s3Result = await getObject({ ...s3Params, Key: `excels/calculate/${xlsx[companyName]}`});

      
          // if(stringAnswers[id])

          if (s3Result.Body) {
            const parsedXlsx = nodeXlsx.parse(s3Result.Body);
            const xlsxData = parsedXlsx[0].data;
    
            const fieldsToParse = Object.keys(answerParser);
            console.log(fieldsToParse)
    
            const paramsForParser = [ xlsxData ];
    
            fieldsToParse.sort().forEach((fieldName) => {
              const [fieldAnswer] = answers.filter((item) => item.field.ref.includes(fieldName));
              if (undefined === fieldAnswer) {
                throw new Error(`No hay valor de ${fieldName}.`)
              }
              let realValue = Parsers[answerParser[fieldName]].parser(fieldAnswer);
              // refactor this
              if (fieldName === 'facturacion') {
                if (realValue.length === 1) {
                  realValue.unshift(0);
                }
                valueReferences[fieldName] = realValue;
                paramsForParser.push(realValue);
              } else if (fieldName === 'indemnizacion') {
                realValue = realValue[0];
                indemnizationValues[companyName] = realValue;
                paramsForParser.push(realValue);
              }
            });
    
            // calculate and store values
            const [ obtainedValue, limitPrice ] = Parsers[excelParser].parser(...paramsForParser);
            valueForCompanies[companyName] = obtainedValue;

            if(form === 'PWRFfyi5') {
              let newVal = parseFloat(obtainedValue);
              newVal += 100.0;
              valueForCompanies[companyName] = newVal;
            }

            if (typeof valueReferences.indemnizacion !== 'object') {
              valueReferences.indemnizacion = {};
            }
  
            if (limitPrice) {
              valueReferences.indemnizacion[companyName] = limitPrice;
            } else {
              valueReferences.indemnizacion[companyName] = indemnizationValues[companyName];
            }
          } else {
            throw new Error('Object not found in S3!');
          }
        }
      }
        
      // all included companies calculated, prepare response
      const baseObj = {
        submitted_at,
        answers: stringAnswers,
        amount: valueForCompanies,
        sent: false,
      };

      // always write even when invalidRange or rangeNotFound
      const writeResult = await handleMongo(
        mongoClient,
        'data',
        { form, email, submitted_at }, 
        baseObj,
        {
          ...baseObj,
          name,            
          form, 
          email,
        }
      );

      if (Object.keys(valueForCompanies).length === 0) {
        // all excluded
        return res.json({ success: false, dataError: 'No podemos ofrecerte una cotización online por las características de tu empresa. Nos pondremos en contacto contigo en un plazo máximo de 48 horas.'});
      }

      const responseObj = createResponseFromValue(email, valueForCompanies);
      const allFailed = Object.keys(responseObj.companiesSuccess).length === 0;
      if (allFailed) {
        return res.json({ success: false, dataError: 'No podemos ofrecerte una cotización online por las características de tu empresa. Nos pondremos en contacto contigo en un plazo máximo de 48 horas.'});
      }

      if (responseObj.success) {
        if (writeResult) {
          const formResponse = await axios.get(`${TYPEFORM_API}/${form}`, {
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`
            }
          });
          const { data: formResponseData } = formResponse;
          const { fields } = formResponseData;
          // returns [array of generic answers, object of client data]
          const fullFields = getFullFields(fields, answers, email)
          // refactor literal string
          const fieldsForPDF = [
            fullFields[0].filter((item) => (!item.isClientData && '¿Cómo nos conociste?' !== item.title)),
            fullFields[1]
          ];

          // después de obtener los datos de cálculo
          // devolvemos la array de compañías al front
          // y generamos los pdf en base a las peticiones
              
          responseObj.pdfContent = {
            title: config.formLabel,
            clientName: name,
            value: valueForCompanies,
            email,
            date: submitted_at,
            companies: companiesToCalculate,
            productName: config.productName,
            answers: fieldsForPDF,
            cover
          };

          if (valueReferences.indemnizacion) {
            responseObj.pdfContent.indemnizacion = valueReferences.indemnizacion;
          }
          if (valueReferences.facturacion && 0 < valueReferences.facturacion.length) {
            responseObj.pdfContent.facturacion = valueReferences.facturacion;
          }
        } else {
          responseObj.success = false;
          responseObj.dataError = 'mongoDBFailure';
        }
      }
  
      return res.json(responseObj);
    }
    
    throw new Error('No data received.');
  } catch (e) {
    return fail(
      res,
      mongoClient,
      {
        message: e,
        form,
        email
      }
    );
  } 
});

app.post('/getChart', async (req, res) => {
  const { form, email, readOnly } = req.body;

  try {
    const config = await loadConfig(form);

    if (!config) {
      throw new Error(`Form ID ${form} not recognized.`);
    } else {
      const returnValues = [];
      const noPointsForms = [];

      const FORMS_ID = await mongoClient.db(DB_NAME).collection('formsAnalisis').find().toArray();
      const { lastResponse, name } = await asyncAPIDriver({ form, email, readOnly });
      
      const { answers, submitted_at } = lastResponse;
      const pointValues = lastResponse.calculated.score.toString().split('');
      if (pointValues.length < FORMS_ID.length) {
        const diffLength = FORMS_ID.length - pointValues.length;
        for (let i = 0; i < diffLength; i++) {
          pointValues.unshift('0');
        }
      }

      FORMS_ID.forEach((val, idx) => {
        if (parseInt(pointValues[idx])) {
          returnValues.push({
            ...val,
            score: parseInt(pointValues[idx])
          })
        } else {
          noPointsForms.push({
            ...val,
            score: parseInt(pointValues[idx])
          })
        }
      });

      const scoreToSave = returnValues.map((item) => item.name);

      if (!readOnly) {
        const stringAnswers = JSON.stringify(answers);
        const writeResult = await handleMongo(
          mongoClient,
          'data',
          { form, email },
          { name, submitted_at, answers: stringAnswers, score: scoreToSave },
          { 
            name,
            submitted_at,
            form,
            email,
            answers: stringAnswers,
            score: scoreToSave,
          }
        )

        if (writeResult) {
          // SOLO PARA DESARROLLO LOCAL
          // AL SUBIR TIENE QUE ESTAR DENTRO DE !readOnly y writeSuccess
          const formResponse = await axios.get(`${TYPEFORM_API}/${form}`, {
            headers: {
              'Authorization': `Bearer ${AUTH_TOKEN}`
            }
          });
          const { data: formResponseData } = formResponse;
          const { fields } = formResponseData;
          // returns [array of generic answers, object of client data]
          const fullFields = getFullFields(fields, answers, email)
          // refactor literal string
          sendChartEmail({ email, answers: fullFields, score: scoreToSave });

          return res.json([ ...returnValues, ...noPointsForms ]);
        }
        
        return res.json('ERROR: mongoDBFailure');
      }
      
      return res.json([ ...returnValues, ...noPointsForms ]);
    }
  } catch (catchedError) {
    return fail(res, mongoClient, { email, form, message: catchedError})
  } 
});

app.post('/mail', async (req, res) => {
  const { phone, email, message } = req.body;

  let transporter = nodemailer.createTransport({
    host: 'smtp.serviciodecorreo.es',
    port: 465,
    auth: {
      user: EMAIL,
      pass: EMAIL_PASS
    }
  });
  let info = await transporter.sendMail({
    from: EMAIL,
    to: EMAIL_RECEIVER,
    subject: `Solicitud ${phone}`,
    text: `
Teléfono del cliente: ${phone}.
Email del cliente: ${email}.

${message}
    `
  });

  const { accepted } = info;
  if (accepted.length > 0) {
    res.send(true);
  } else {
    res.send(false);
  }
})

// Authentication
UserRoutes(app, mongoClient);

app.get('/csv/:formID', async (req, res) => {
  const { formID } = req.params;
  const { field, company } = req.query;
  const config = await loadConfig(formID);

  try {
    const { [field]: files } = config;
    const fileName = files[company];
    // cambiar config.xlsx por lo que decidamos hacer con las compañías
    // 1.- descargarlo todo
    // 2.- Tener varios botones en el front
    const s3Res = await getObject({...s3Params, Key: `${fieldsDirectories[field]}/${fileName}`});
    const parsedXlsx = nodeXlsx.parse(s3Res.Body);
    const [{ data }] = parsedXlsx;
    let csvString = '';

    for(let i = 0; i < data.length; i++) {
      csvString += data[i].join(";") + "\n";
    }

    res.json({ fileName, csvString });
  } catch (e) {
    console.error(e);
    res.json(`ERROR: ${e}`);
  }
})

app.get('/responses/:id', async (req, res) => {
  // req debería traer un JWT que autorice al user
  // hacemos una capa middleware para los endpoints que
  // no sean calculate, login etc
  const { id } = req.params;
  const formTestData = await mongoClient.db(DB_NAME).collection('data');
  const dataArray = await formTestData.find({ form: id }).toArray();
  if (dataArray.length > 0) {
    const returnValue = dataArray.map((item) => {
      delete item._id
      return item;
    })
    res.send(returnValue);
  } else {
    res.send([]);
  }
})

app.post('/sign', async (req, res) => {
  const { email, submitted_at, form, company, answers, value, indemnizacion } = req.body;
  const signResult = await (await MongoDriver(mongoClient, 'data'))
    .update(
      { email, submitted_at, form },
      { signed: company }
    );

  if (signResult) {
    const emailResult = await prepareEmail({
      emailData: {
        user: EMAIL,
        pass: EMAIL_PASS,
        receiver: EMAIL_RECEIVER_CHART,
      },
      subject: `Póliza para ${email} por ${capitalize(company)}.`,
      html: /* html */`<h3>Análisis para ${email}:</h3>
      <div>
        <h4>Resultado</h4>
        <ul>
          <li><b>Límite de indemnización:</b> ${indemnizacion}</li>
          <li><b>Valor de la prima:</b> ${value}</li>
        </ul>
      </div>
      <div>
        <h4>Cuestionario</h4>
        <div>
          ${displayAnswers(answers)}
        </div>
      </div>`
    })

    res.json({ success: emailResult?.accepted?.length > 0 });
  } else {
    fail(res, mongoClient, {
      message: "Sign update failed.",
      email, form
    })
  }
})

// el cron atacará este endpoint periódicamente
// debería mandarnos los datos con los que identificar el registro [ formID | email | submitted_at ]
app.get('/offer', async (req, res) => {
  const data = await (await MongoDriver(mongoClient, 'data')).findMany({ sent: false, signed: { $exists: true } });
  const results = [];

  try {
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const { answers, submitted_at, name, email, amount, signed, form } = item;    
  
      const formConfig = await loadConfig(form);
      const value = amount[signed];
      const { internal_id, branch, executive, productName } = formConfig;
  
      const parsed = parseAnswers(answers);
  
      const { nif, phone, address, cp, location, activity } = parsed;
      const [ firstName, firstSurname, secondSurname ] = name.replace(/[.]/gu, '').split(' ');
      const filename = `public/result-${internal_id}-${signed}-${email}.pdf`.toLowerCase().replace(/\s/gu, '');
      const productID = productIDMap?.[signed]?.[internal_id];
  
      const executiveID = executive;
  
      if (productID === undefined) {
        throw new Error(`No product ID found for product ${internal_id} in company ${signed}. Aborting.`);
      }
  
      const companyObj = await (await MongoDriver(mongoClient, 'companies')).findOne({ name: signed });
      const { id: companyID } = companyObj;
      const tax = TAX_VALUE || 8.15;
  
      const netValue = (parseFloat(value) * (100 - tax) / 100).toFixed(2);
  
      const iteratorData = {
        submitted_at,
        nif,
        document: {
          company: signed,
          pdfFileName: filename,
        },
        branchAlias: branch,
        companyID,
        productID,
        executiveID,
        productName,
        clientData: {
          name: firstName,
          surname1: firstSurname || '',
          surname2: secondSurname || '',
          address,
          phone,
          cp: cp || '',
          activity,
          location: location || '',
          email,
        },
        value: netValue,
        filename,
        form,
      }

      const iteratorResult = await Iterator(res, mongoClient, iteratorData);
      results.push(iteratorResult);
  
      const updateResult = await (await MongoDriver(mongoClient, 'data')).update(
        { email, submitted_at, form },
        { sent: true }
      );

      if (!updateResult) {
        fail(res, mongoClient, {
          message: 'MongoDB update failed',
          email,
          form,
        })
      }
    }
    res.send(true);
  } catch(e) {
    console.error(e);
    res.send(false);
  }
})

app.listen(PORT, async () => {  
  await mongoClient.connect();
  console.log(`Listening on port ${PORT}.`);
});
