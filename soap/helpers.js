const request = require('request');
const Rijndael = require('rijndael-js');
const derp = require('derive-password-bytes');
require('dotenv').config();

const { VERBOSE, FIXIE_URL } = process.env;

const fixieRequest = request.defaults({ 'proxy': FIXIE_URL, 'timeout': 50000, 'connection': 'keep-alive' });

export const wsdlOptions = {
  request: fixieRequest,
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
}

const replaceAll = (str, find, replace) => str.replace(new RegExp(find, 'gu'), replace);

export const log = (override, ...messages) => {
  if (VERBOSE || override === true) {
    console.log(...messages)
  }
}

const createTimeStamp = () => {
  const TIMESTAMP_FORMAT = "yyyyMMddHHmmssff";
  let now = new Date().toISOString();
  // now = now.;
  now = replaceAll(now, "-", "");
  now = replaceAll(now, "T", "");
  now = replaceAll(now, ":", "");
  now = now.replace(".", "");
  now = now.substring(0, TIMESTAMP_FORMAT.length);
  return now;
}

const generateServiceKeyToken = (valueToEncrypt) => {
  const valuePassPhrase = 'E-Client-Pas5pr@se';
  const valueHashAlgorithm = 'MD5';
  const valueInitVector = '@1B2c3D4e5F6g7H8';
  const valueKeySizeBytes = 32;
  const valuePasswordIterations = 2;
  const valueSaltValue = 'E-Client-s@1tValue';
  const plainText = valueToEncrypt || createTimeStamp();

  const key = derp(valuePassPhrase, valueSaltValue, valuePasswordIterations, valueHashAlgorithm, valueKeySizeBytes);
  const cipher = new Rijndael(key, 'cbc');
  let bufferVector = Buffer.from(valueInitVector);
  let plainTextBuffer = Buffer.from(plainText);
  const pad = new Array(plainTextBuffer.length).fill(16);
  plainTextBuffer = [...plainTextBuffer, ...pad]
  const ciphertext = Buffer.from(cipher.encrypt(plainTextBuffer, 16, bufferVector));
  return ciphertext.toString("base64");
}


export const header = {
  RequestHeader: {
    attributes: {
      xmlns: 'mpm.seg.ServicesClient',
      "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance"
    },
    ApplicationCode: {
      $value: "eClient",
      attributes: {
        xmlns: 'http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Request',
        "xmlns:a": "http://schemas.microsoft.com/2003/10/Serialization/Arrays"
      }
    },
    Companies: {
      attributes: {
        xmlns: 'http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Request',
        "xmlns:a": "http://schemas.microsoft.com/2003/10/Serialization/Arrays"
      },
      "a:string": "1939"
    },
    Cultures: {
      attributes: {
        xmlns: 'http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Request',
        "xmlns:a": "http://schemas.microsoft.com/2003/10/Serialization/Arrays"
      },
      "a:string": "es-ES"
    },
    Login: {
      attributes: {
        xmlns: 'http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Request'
      },
      UserName: "administrador",
      // VsegUserId: "jgX68agN5@"
      VsegUserId: "771"
    },
    ServiceKeyValidation: generateServiceKeyToken(),
  }
};

export const productIDMap = {
  beazley: {
    do: 7232,
    rcp: 7233,
    cyber: 7234,
  },
  hiscox: {
    rcp: 2079,
    do: 7129,
    cyber: 7214,
  },
  markel: {
    do: 7366,
    rcp: 7355,
  }
}

export const inject = (originalClient) => {
  originalClient.wsdl.xmlnsInEnvelope = 'xmlns:tem="http://tempuri.org/" xmlns:ser="http://schemas.microsoft.com/2003/10/Serialization/" xmlns:mpm="http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common" xmlns:mpm1="http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Figuras" xmlns:mpm2="http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.General" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays" xmlns:mpm3="http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Productos" xmlns:mpm4="http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.General.Contratos" xmlns:mpm5="http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Siniestros"'
  originalClient.addSoapHeader(header, "mpm.seg.ServicesClient", "");
  return originalClient;
}

export const extract = (data, ...keys) => {
  let result = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let valueRef = i === 0 ?
      data :
      result;

    if (![ 'number', 'string' ].includes(typeof key)) {
      throw new Error('Invalid key type in extract array.');
    }

    result = valueRef[key];

    if (result === undefined) {
      result = false;
      break;
    }
  }

  return result;
}
