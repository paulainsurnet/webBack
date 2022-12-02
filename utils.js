import axios from 'axios';
import MongoDriver from './mongo-driver';
import AWS from 'aws-sdk';
import fs from 'fs';
import nodemailer from 'nodemailer';

import dotenv from 'dotenv';

dotenv.config();

const s3 = new AWS.S3();

const { 
  TYPEFORM_API, AUTH_TOKEN,
  ASYNC_API_MAX_TRIES, ASYNC_WAIT_SECONDS,
  ASYNC_TIMESTAMP_MAX_DIFF_MINUTES, S3_BUCKET,
  EMAIL, EMAIL_PASS, EMAIL_RECEIVER_CHART
} = process.env;

const axiosOptions = {
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
}

export const s3Params = { Bucket: S3_BUCKET };

export const validNameIdentifiers = ['Tomador', 'Nombre', 'Nombre del tomador', 'Nombre del tomador.']; // temporal, en el futuro pasarlo a base de datos

export const prepareEmail = async ({ emailData, subject, text, html }) => {
  const { user, pass, receiver } = emailData;
  let transporter = nodemailer.createTransport({
    host: 'smtp.serviciodecorreo.es',
    port: 465,
    auth: { user, pass }
  });

  const options = {
    from: user,
    to: receiver,
    subject,
  }

  if (text) {
    options.text = text;
  }

  if (html) {
    options.html = html;
  }

  let info = await transporter.sendMail(options);
  return info;
}


export const deleteOldestFile = () => {
  const dir = 'public/'
  const MAX_FILES = 9;
  let result = [];

  fs.readdir(dir, (err, files) => {

    result = files.map((fileName) => ({
      name: fileName,
      time: fs.statSync(dir + '/' + fileName).mtime.getTime()
    }))
      .sort((a, b) => (a.time - b.time))
      .map((v) => v.name);
    
    if (result.length > MAX_FILES) {
      result.slice(0, result.length - MAX_FILES).forEach((item) => {
        fs.unlinkSync(`${dir}${item}`);
      })
    }
  });
}

export const getSectorByActivity = (sectors, activity) => sectors.filter((item) => {
  const { activities } = item;

  return activities.filter((activityItem) => activityItem === activity).length > 0;
})[0];

export const parseAnswers = (stringAnswers) => {
  const parsed = JSON.parse(stringAnswers);
  const returnObj = {};
  parsed.forEach((item) => {
    const { field, type } = item;
    const value = item[type];
    const { ref } = field;
    returnObj[ref] = value;
  });

  return returnObj;
}

export const getAnswerByRef = (refToSearch, answers) => answers.filter((item) => {
  const { fields } = item;
  if (fields.length > 0) {
    const [ { field } ] = fields;
    const { ref } = field;
  
    return refToSearch === ref;
  }

  return false;
})[0]?.fields?.[0]?.text

export const createResponseFromValue = (email, valueForCompanies) => {
  const responseObj = { email, success: true, companiesSuccess: {}, };

  for (const companyName of Object.keys(valueForCompanies)) {
    const value = valueForCompanies[companyName];
    let companySuccess = true;
    let dataError = null;

    if (null === value) {
      // value not found
      companySuccess = false;
      dataError = 'limitNotCovered';
    }
  
    if (false === value) {
      // invalid combination
      companySuccess = false;
      dataError = 'invalidRange';
    }

    if (companySuccess) {
      responseObj.companiesSuccess[companyName] = {
        success: companySuccess, dataError
      };
    }
  }

  return responseObj;
}
export const getObject = async (params) => {
  const result = await s3.getObject({ ...params }).promise();
  return result;
}
export const handleExclusions = (rules, answers) => {
  let isExcluded = false;

  rules.some((rule) => {
    if (rule.length === 0) return false;
    if (isExcluded) return true // already failed a rule, out
    let [ ruleRef, checker ] = rule;

    ruleRef = ruleRef.trim();

    answers.some((item) => {
      const { field, type } = item;
      const value = item[type];
  
      if (field !== undefined) {
        const { ref } = field;
        if (ref === ruleRef) { // found
          console.log(ref)
          console.log(value.toString());
          console.log(checker)
          console.log(typeof value)
          checker = checker.trim();
          const stringToSplit = checker.slice(1).slice(0, checker.length - 2).replace(/; /ugi, ';').replace(/'/ug, "");
          const arrayOfValues = stringToSplit.split(';').map((item) => {
            if (item[item.length - 1] === '.') {
              item = item.slice(0, item.length - 1);
            }
            return item;
          });

          if (checker[0] === '[') { // blacklist
            if (arrayOfValues.includes(value)) {
              isExcluded = true;
            }
          } else if (checker[0] === '(') {
            // for multichoice, all elements in checker must be in labels
            // it should always be a choices type to have labels
            if (value.labels !== undefined) {
              value.labels = value.labels.map((label) => {
                if (label[label.length - 1] === '.') {
                  label = label.slice(0, label.length - 1);
                }
                return label;
              })
              arrayOfValues.forEach((item) => {
                if (item[item.length - 1] === '.') {
                  item = item.slice(0, item.length - 1);
                }

                if (!value.labels.includes(item)) {
                  isExcluded = true;
                }
              });
            }
          } else if (
            (typeof value === 'string' && value === checker) ||
            (typeof value === 'object' && 'label' in value && value === checker) || 
            (typeof value === 'boolean' && value.toString() === checker)
          ) {
            isExcluded = true;
          }
        }
        return isExcluded;
       
      }
      throw new Error('item with no field');
    });

    return false;
  })

  return isExcluded;
}

export const excelParser = (rows, facturacion, limitIndemnization) => {
  let value = [ null ];
  let primeIndex = null;
  // indemnizacion num fij

  // facturacion num
  const ranges = rows.slice(1)[0].slice(1);
  for (let [index, range] of ranges.entries()) {
    let [min, max] = range.split('-');
    min = Number(min.trim().replace(/[.,]/ug, ''));
    max = Number(max.trim().replace(/[.,]/ug, ''));
    if (min <= facturacion[0] && facturacion[1] <= max) {
      primeIndex = index + 1;
      break;
    }
  }

  for (let row of rows.slice(2)) {
    const [limitPrice] = row;
    if (limitIndemnization <= limitPrice) {
      value = Number(row[primeIndex]);

      if (Number.isNaN(value)) {
        value = [ false ];
      } else {
        value = [ value.toFixed(2), limitPrice ];
      }

      break;
    }
  }

  return value;
}

export const indemnizationOnlyParser = (rows, limitIndemnization) => {
  let value = null;

  for (let [index, limitPrice] of rows.slice(1)[0].entries()) {
    if (limitIndemnization <= limitPrice) {
      value = Number(rows.slice(2)[0][index]);

      if (Number.isNaN(value)) {
        value = false;
      } else {
        value = value.toFixed(2);
      }
  
      break;
    }
  }

  return value;

}

export const numberParser = (answer) => {
  const { type } = answer;
  const value = answer[type];
  return [value, value];
}
export const multipleChoiceParser = (answer) => {
  const parsedResponse = [];
  const { type } = answer;
  const { label } = answer[type];
  const labelArr = label.split(' ');
  for (const labelFragment of labelArr) {
    if ((/\d/u).test(labelFragment)) {
      const escapedNumber = labelFragment.replace(/[.,€]/ug, '');
      try {
        const parsedNumber = Number(escapedNumber);
        if (!Number.isNaN(parsedNumber)) {
          parsedResponse.push(parsedNumber);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  return parsedResponse;
}

const searchField = (id, arrayToSearch) => arrayToSearch.filter((item) => item.field.id === id)[0];

export const formatCurrency = (num) => {
  if (Number.isNaN(Number(num))) {
    return false;
  }
  const localeString = Number(num).toLocaleString('de', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // el formato en local se rompe y muestra undefined 
  // pero en producción debería funcionar

  // mirar el tema de implementar full-icu 

  const [ number, currency ] = localeString.split(/\s/u);
  const [ integer, decimal ] = number.split(',');
  const stringToReturn = `${integer}${'00' !== decimal ?
    `,${decimal}` :
    ''}${currency}`;
  return stringToReturn;
};

export const getFullFields = (fields, parsedAnswers, email) => {
  const groups = [];
  for (let i = 0; i < fields.length; i++) {
    const item = fields[i];
    const {
      type, title, properties, id
    } = item;
    let totalFields = [];

    if (['multiple_choice', 'picture_choice'].includes(type)) {
      totalFields = [ searchField(id, parsedAnswers) ];

      if (undefined === totalFields[0]) {
        totalFields = [];
      }
    } else if (0 < Object.keys(properties).length && 'fields' in properties) {
      const answerFields = properties.fields;
      try {
        totalFields = answerFields.map((fieldItem) => ({
          title: fieldItem.title,
          fields: searchField(fieldItem.id, parsedAnswers)
        })).filter((fieldItem) => fieldItem.fields !== undefined);
      } catch (e) {
        console.log(e);
        throw new Error(`getFullFields failed due to: ${e}`);
      }
    } else {
      // campo sin fields en properties
      // find by id and try to get a value
      const fieldInAnswers = searchField(id, parsedAnswers);
      if (fieldInAnswers) {
        totalFields.push(fieldInAnswers)
      }

      // si no hay field puede ser un error pero también un campo sin 
      // contestar (ya sea por lógica del form o el propio user)
    }

    // para identificar qué objeto contiene los datos cliente
    // podríamos utilizar el email y buscar el campo tipo email
    // con ese valor para identificar la sección con los datos

    let isClientData = false;
    const emailFields = totalFields.filter(item => item.fields && item.fields.type === 'email');
    if (0 < emailFields.length) {
      let emailRef = emailFields.filter(item => item.fields.email === email)[0];
      if (undefined !== emailRef) isClientData = true;
    }

    if (type === 'group' && !isClientData) {
      // group con fields anidados
      properties.fields.forEach(({ id: fieldID, title: fieldTitle}) => {
        const fieldInAnswer = searchField(fieldID, parsedAnswers);
        if (fieldInAnswer !== undefined) {
          groups.push({
            title: fieldTitle,
            fields: [ fieldInAnswer ],
            isClientData: false,
          })
        }
      })
    } else {
      groups.push({
        title,
        fields: totalFields,
        isClientData,
      });
    }
  }

  const clientDataObj = groups.filter(item => item.isClientData)[0];

  if (undefined === clientDataObj) {
    throw new Error('No client data recognized.');
  }

  const clientDataFields = clientDataObj.fields;
  const clientData = {};
  for (let i = 0; i < clientDataFields.length; i++) {
    const dataField = clientDataFields[i];
    const clientFieldType = dataField.fields.type;
    let clientFieldValue = dataField.fields[clientFieldType];
    
    if ('choice' === clientFieldType) {
      clientFieldValue = clientFieldValue.label;
    }

    clientData[dataField.title] = clientFieldValue;
  }

  return [groups, clientData];
}

export const handleFields = (fieldItem) => {
  let value = null;
  const { type } = fieldItem;
  const objValue = fieldItem[type];
  delete objValue.id;
  const objType = typeof objValue;
  if ([ 'object', 'boolean' ].includes(objType)) {
    if ('object' === objType) {
      const { label, labels } = objValue;
      if (undefined === label) {
        if (undefined !== labels) {
          value = labels.join('.<br /> ') + '.';
        } else {
          value = JSON.stringify(objValue);
        }
      } else {
        value = label;
      }
    } else { // boolean
      value = objValue ?
        'Sí' :
        'No';
    }
  } else if ('date' === type) {
    value = new Date(objValue).toLocaleDateString('es', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } else {
    value = objValue;
  }

  return value;
};

export const getTextFromLink = (link) => {
  // eslint-disable-next-line prefer-named-capture-group
  const regex = /\[\*(.*)\*\]\(.*\)/u;
  const match = regex.exec(link);
  const [ original, text ] = match;
  if (original && text) {
    return link.replace(original, text);
  }
  return link;
}

export const stripDirFromPath = (path, dir) => path.slice(path.indexOf(dir) + dir.length, path.length);

export const handleMongo = async (
  mongoClient, 
  collection, 
  findQuery, 
  updateObj, 
  insertObj
) => {
  // Get driver methods, execute update or insert based on findOne
  const driverMethods = (await MongoDriver(mongoClient, collection));
  const found = await driverMethods.findOne(findQuery);
  const method = found ?
    'update' :
    'insert';
  // Ternary of params for update / insert
  const params = found ?
    [
      findQuery,
      updateObj
    ] :
    [ insertObj ];
    
  return driverMethods[method](...params);
}

export const writeLogEntry = async (mongoClient, logEntry) => {
  const driverMethods = (await MongoDriver(mongoClient, 'log'));
  return driverMethods.insert({
    ...logEntry,
    timestamp: new Date().toString()
  })
}

export const getResponseAndClient = async (form, email) => axios.get(`${TYPEFORM_API}/${form}`, axiosOptions)
  .then(({ data }) => data)
  .catch((err) => err)
  .then((formData) => {
    const { fields } = formData;
    // get form response by this email
  
    return axios.get(
      `${TYPEFORM_API}/${form}/responses?completed=true&query=${email}`,
      axiosOptions
    ).then(async (response) => {
    
      if (response) {
        let clientName = null;
        const { data } = response;
        if (data && data.items && 0 < data.items.length) {
          // spread
          const { answers } = data.items[0]; // most recent answers by this email
          const [, clientData] = getFullFields(fields, answers, email);

          // Get name based on clientData
          const clientKeys = Object.keys(clientData);
          for (let i = 0; i < clientKeys.length; i++) {
            const key = clientKeys[i];
            if (validNameIdentifiers.includes(key)) {
              clientName = clientData[key];
            }
          }

          return {
            fields,
            data,
            clientData,
            name: clientName,
          }
        }
      }

      return null;
    }).catch((err) => {
    
      console.log(err);
      throw err;
    })
  })
  .catch(e => {
    console.log(e);
    throw e;
  })

export const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

export const asyncAPIDriver = async (apiParams, tries = 0) => {
  const { form, email, readOnly } = apiParams;
  const response = await getResponseAndClient(form, email);
  const currentTime = Date.now();

  const tryAgain = () => new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        console.log('Launch driver');
        const result = await asyncAPIDriver(apiParams, tries + 1)
        resolve(result);
      } catch (e) {
        console.log('Error catched');
        reject(e);
      }
    }, ASYNC_WAIT_SECONDS * 1000)
  });

  if (null !== response) {
    const { data, name } = response;
    if (data && data.items && 0 < data.items.length) {
      const [ lastResponse ] = data.items;
      if (readOnly) {
        return { name, lastResponse };
      }
      const { submitted_at } = lastResponse;
      const submittedTimestamp = Number(new Date(submitted_at));
      if (
        (submittedTimestamp + 
          ((ASYNC_TIMESTAMP_MAX_DIFF_MINUTES * 60) * 1000)
        ) > currentTime) {
        // Si timestamp + 2 minutos es mayor que now
        return { name, lastResponse };
      }
    }
  } else {
    console.log('No data from API');
  }

  if (tries >= ASYNC_API_MAX_TRIES) {
    throw new Error(`Response submition time inconsistency. Aborted after ${ASYNC_API_MAX_TRIES} tries.`)
  }

  console.log('No timestamp match.');
  return tryAgain();
}

export const getSignedUrl = async (method, s3Params, fileName, type) => new Promise((resolve, reject) => {
  const params = {
    ...s3Params,
    Key: fileName,
    Expires: 6000,
  };
  
  if (type) {
    params.ContentType = type;
  }

  s3.getSignedUrl(method, params, (error, url) => {
    if (error) reject(error);
    resolve(url);
  })
})

export const displayAnswers = (answers) => {
  let answersView = '';
  const [ generalData, clientData ] = answers;
  
  const filteredItems = generalData.filter((answer) => (0 < answer.fields.length) && (!answer.isClientData));

  filteredItems.forEach((answer) => {
    const { fields } = answer;
    let { title: questionTitle } = answer;
    let displayValue = null;
    displayValue = handleFields(fields[0]);
    
    if ((/\[\*/u).test(questionTitle)) {
      questionTitle = getTextFromLink(questionTitle);
    }

    answersView += /* html */`
      <li class="question">
        <span class="title">${questionTitle}</span>
        <div>
          <span class="answer">${displayValue}</span>
        </div>
      </li>
      `;
  });

  Object.keys(clientData).forEach((clientKey) => {
    let questionTitle = clientKey;
    let questionValue = clientData[clientKey];

    if ((/\[\*/u).test(questionTitle)) {
      questionTitle = getTextFromLink(questionTitle);
    }

    if (questionValue === true) questionValue = 'Sí';
    if (questionValue === false) questionValue = 'No';

    const displayValue = 'object' === typeof questionValue ?
      handleFields(clientData[clientKey]) :
      questionValue;

    answersView += /* html */ `
      <li class="question">
        <span class="title">${questionTitle}</span>
        <div>
          <span class="answer">${displayValue}</span>
        </div>
      </li>
    `;
  });

  return answersView;
}

export const sendChartEmail = async ({ email, answers, score }) => prepareEmail({
  emailData: {
    user: EMAIL,
    pass: EMAIL_PASS,
    receiver: EMAIL_RECEIVER_CHART
  },
  subject: `Resultado análisis ${email}`,
  html: `
    <h3>Análisis para ${email}:</h3>
    <div>
      <h4>Productos recomendados</h4>
      <ul>
      ${
  score.map((item) => (
    `<li>${item}</li>`
  ))
}
      </ul>
    </div>
    <div>
      <h4>Cuestionario</h4>
      <div>
        ${displayAnswers(answers)}
      </div>
    </div>
  `
})

export const tempJoined = {
  'rcp': true, // meter compañía
  'do': true,
}

export const detailsJoined = [ 'rcp-markel-top', 'rcp-markel-it' ];

export const fieldsDirectories = {
  'xlsx': 'excels/calculate',
  'exclusions': 'excels/exclusions',
}

export const generateTable = (config) => {
  let htmlStr = /* html */`<table>`;

  config.forEach((item) => {
    let { value, dotted, parts } = item;
    const { title } = item;

    if (value === undefined) {
      value = 'Sin sublímite';
    }

    if (dotted === undefined) {
      dotted = false;
    }

    if (parts !== undefined) {
      let partTdStr = /* html */`<tr><td><span>${title}</span>`;
      parts.forEach((partItem) => {
        partTdStr = /* html */`
      ${partTdStr}
          <p style="position:relative;padding-left: 1.5em"><span class="dot"></span>${partItem}</p>
      `
      });
      partTdStr = /* html */`${partTdStr}</td>
      <td class="row-value">
      <br />
        ${parts.map(() => /* html */`<p>${value}</p>`).join('')}
      </td>
      </tr>`;
      htmlStr = /* html */`
        ${htmlStr}
        ${partTdStr}
      `;
    } else {
      htmlStr = /* html */`
      ${htmlStr}
      <tr>
        <td class=${`${dotted ?
    'dot-value' :
    ''} row-title`}>${dotted ?
  /* html */`<span class="dot"></span>` :
  ''}${title}</td>
        <td class="row-value">
          ${value}
        </td>
      </tr>
      `
    }

  });

  htmlStr = /* html */`${htmlStr}</table>`;

  return htmlStr;
}
