const soap = require('soap');
import { urlOportunidades } from './urls';
import { log, extract, inject, wsdlOptions } from './helpers';
import { addCliente, addOportunidad, addDocument, uploadDocument, addCotizacion, getElementGeneral, addRiesgo } from './adders';

export const ramoCallback = async (client, data, idRef) => {
  const { branchAlias: alias } = data;
  const result = await client.FindByAliasAsync({ alias });
  console.log('R', result);
  const RamoID = extract(result, 0, 'FindByAliasResult', 'Id');

  idRef.BranchID = RamoID;
}
export const clientCallback = async (client, data, idRef) => {
  log(true, 'SEARCHING CLIENT...');
  const { nif, submitted_at, clientData, value, executiveID, productName } = data;
 
  const result = await client.FindByNifAsync({ nif });

  try {
    const [ { FindByNifResult } ] = result;
    let ClientID = null;

    if (FindByNifResult === null) {
      // not found, we create it
      log(true, 'CLIENT NOT FOUND. CREATING...')

      const surnames = [ 'surname1', 'surname2' ];

      for (let i = 0; i < surnames.length; i++) {
        if (clientData[surnames[i]] === '') {
          clientData[surnames[i]] = '-';
        }
      }

      const newClientObj = addCliente({ nif, submitted_at, clientData });

      const CreateResult = await client.CrearClienteAsync(newClientObj);

      log(true, 'CREATE RESULT FOR CLIENT', CreateResult);
      ClientID = extract(CreateResult, 0, 'CrearClienteResult', 'Data', 'Id');

      log(true, 'CLIENT CREATED', 'NEW CLIENT ID :', ClientID);
    } else {
      ClientID = extract(FindByNifResult, 'ClienteBaseDTO', 'Id');
      log(true, "CLIENT FOUND.", "CLIENT ID :", ClientID);
    }

    log(true, client.lastRequest);
 
    idRef.ClientID = ClientID;
  } catch (e) {
    console.error(e);
    return false;
  }

  log(true, 'CREATING OPPORTUNITY...');
  // idCliente
  let clientOP = await soap.createClientAsync(urlOportunidades, wsdlOptions);
  clientOP = inject(clientOP);

  const OPResult = await clientOP.CrearOportunidadAsync(addOportunidad(
    idRef.ClientID, 
    { description: productName, executive: executiveID, branch: idRef.BranchID, value }, 
    submitted_at
  ));

  console.log(true, 'CREATE OPPORTUNITY LAST REQUEST', clientOP.lastRequest);

  const OpportunityID = extract(OPResult, 0, 'CrearOportunidadResult', 'Data', 'Id');
  idRef.OpportunityID = OpportunityID;
  log(true, 'OPPORTUNITY ID :', OpportunityID);
  return true;
};

export const addDocumentCallback = async (clientDoc, data, idRef) => {
  // 4355 Es el ID de la oportunidad.
  const { document } = data;  
  const result = await clientDoc.CrearDocumentoAsync(addDocument({ ...document, opID: idRef.OpportunityID }));
  
  const DocumentID = extract(result, 0, 'CrearDocumentoResult', 'Data', 'Id');
  idRef.DocumentID = DocumentID;
  log(true, "DOCUMENT ID : ", DocumentID);
};

export const uploadDocumentCallback = async (clientUpload, data, idRef) => {
  // 70608 es el ID obtenido de CREARDOCUMENTO
  const { filename } = data;
  const result = await clientUpload.SubirDocumentoAsync(uploadDocument({
    documentID: idRef.DocumentID,
    fileName: filename,
  }));
  const uploadedID = extract(result, 0, 'SubirDocumentoResult', 'Data', 'Id');
  idRef.UploadedID = uploadedID;
  log(true, 'UPLOADED DOCUMENT ID :', uploadedID);
}

export const generalCallback = async (generalClient) => {
  const result = await generalClient.FindElementsSimpleAsync(getElementGeneral("EJECUTIVOS"));
  
  log(JSON.stringify(result));
  log('last request: ', generalClient.lastRequest);
}

export const createContributionCallback = async (contributionClient, data, idRef) => {
  const { companyID, productID, value, submitted_at } = data;
  const result = await contributionClient.CrearCotizacionAsync(addCotizacion({
    opportunityID: idRef.OpportunityID,
    companyID,
    productID,
    value,
    submitted_at,
  }));
  log(true, JSON.stringify(result));
  log('last request: ', contributionClient.lastRequest);
}

export const createRiskCallback = async (riskClient, data, idRef) => {
  const { submitted_at, clientData, productName } = data;
  const { activity } = clientData;
  // console.log(client.wsdl._xmlnsMap());
  console.log('ID OPORTUNIDAD', idRef.OpportunityID);
  const result = await riskClient.CrearRiesgoVariosOportunidadAsync(addRiesgo({
    opportunityID: idRef.OpportunityID,
    name: productName,
    description: activity,
    submitted_at,
  }));
  console.log('RISK RESULT', result);

  const RiskID = extract(result, 0, 'CrearRiesgoVariosOportunidadResult', 'Data', 'Id');
  idRef.RiskID = RiskID;
}
