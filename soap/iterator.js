const soap = require('soap');
import { inject, log, wsdlOptions } from './helpers';
import { urlRamo, urlClientes, urlArchivoDocumental, urlGeneral, urlCotizacion, urlRiesgo } from './urls';
import { ramoCallback, clientCallback, addDocumentCallback, uploadDocumentCallback, generalCallback, createContributionCallback, createRiskCallback } from './callbacks';

const urls = [ urlRamo, urlClientes, urlArchivoDocumental, urlArchivoDocumental, urlGeneral, urlCotizacion, urlRiesgo ];
const callbacks = [ ramoCallback, clientCallback, addDocumentCallback, uploadDocumentCallback, generalCallback, createContributionCallback, createRiskCallback ];

export default async (res, mongoClient, data) => {
  const IDValues = {};

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const callback = callbacks[i];

    // hay que ver cómo devuelve errors en Async
    const result = await soap.createClientAsync(url, wsdlOptions);    


    // check error genérico
    log(true, result.lastRequest);
    await callback(inject(result), data, IDValues);
    log(true, result.lastRequest)
  }

  log(true, '\nFinished.');
  log(true, 'values', IDValues);
  return IDValues;
}
