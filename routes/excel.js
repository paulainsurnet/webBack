import MongoDriver from '../mongo-driver';
import { getSignedUrl, s3Params, fieldsDirectories } from '../utils';

export default (app, mongoClient, loadConfig) => {
  app.post('/excel/:formID', async (req, res) => {
    const { formID } = req.params;
    const { field, type } = req.body;
    let { name: fileName } = req.body;
    if (undefined === fileName) {
      const config = await loadConfig(formID);
      fileName = config.xlsx;
    }
  
    // qué hacemos con ambas subidas (exclusión + cálculo)
    // si tenemos botones en el front para cada uno,
    //    podemos recibir el resto de info en req
    // si no podemos también descargarlos todos
    //    iteramos haciendo un getSignedUrl (aumentamos el Expires)
    //    acumulamos las urls firmadas y las devolvemos
    //    el front itera y hace los puts (ahora hace el put directo)
  
    try {
      const destination = `${fieldsDirectories[field]}/${fileName}`;
      const result = await getSignedUrl('putObject', s3Params, destination, type);
      res.json({ url: result, destination });
    } catch(e) {
      console.log(e);
    }
  })
  
  app.put('/excel/:formID', async (req, res) => {
    const { formID } = req.params;
    const { general, specific } = req.body;
    const { field, company, name } = specific;
    const updateObj = { ...general };

    
    try {
      const originalRegister = await (await MongoDriver(mongoClient, 'config')).findOne({ formID });

      updateObj[field] = originalRegister[field];
      updateObj[field][company] = name;

      const result = await (await MongoDriver(mongoClient, 'config')).update({ 
        formID 
      }, { ...updateObj });
      res.send(result);
    } catch (e) {
      res.json({ success: false, message: `Fallo al modificar registro de configuración.` })
    }
  })
  
  app.get('/excel/:formID', async (req, res) => {
    const { formID } = req.params;
    const { field, company } = req.query;

    if (field && company) {
      const config = await loadConfig(formID);
      if (config !== null) {
        const { [field]: files } = config;
        const fileName = files[company];
        res.attachment(fileName);
        res.setHeader('Transfer-Encoding', 'chunked');
        const url = await getSignedUrl('getObject', s3Params, `${fieldsDirectories[field]}/${fileName}`);
        res.status(200).send(url);
      }
    } else {
      res.status(400).send({ error: true });
    }
  })
}
