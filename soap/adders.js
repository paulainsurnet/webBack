                                                                                                                                                                                                                                   
import fs from 'fs';
import { addDays } from './helpers';
export const addCliente = ({ nif, submitted_at, clientData }) => {
  const client = {
    "clienteDTO": {
      attributes: {
        "xmlns:a": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Figuras",
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns:z": "http://schemas.microsoft.com/2003/10/Serialization/",
      },
      "a:Apellido1": clientData.surname1,
      "a:Apellido2": clientData.surname2,
      "a:Entidad": "2", // ?
      "a:Estado": "1", // ?
      "a:FechaAlta": submitted_at,
      "a:Nif": nif,
      "a:Nombre": clientData.name,
      "CodigoInterno": "Z888888", // de dónde sale ?
      "Direccion": {
        "CP": clientData.cp,
        "Email": clientData.email,
        "Localidad": clientData.location,
        "NombreDireccion": clientData.address,
        "Principal": "true",
        "TelfMovil": clientData.phone,
      },
      "a:Colaborador1": {
        attributes: {
          "xmlns:b": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Figuras",
          "z:Id": "i3",
        },
        "Id": {
          attributes: {
            "xmlns": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common"
          },
          $value: 56,
        },
        "b:Estado": "3"
      },
      "a:GestorDeCobro": {
        attributes: {
          "z:Id": "i9",
        },
        "a:Estado": "3",
        "a:Tipo": "3"
      }
    },
    "criterios": {
      attributes: {
        "xmlns:a": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.General",
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance",
      },
      "a:CriterioDTO": {
        "a:Valor": {
          attributes: {
            "xmlns:z": "http://schemas.microsoft.com/2003/10/Serialization/",
            "z:Id": "i2",
          },
          "a:Descripcion": clientData.activity,
        },
        "a:Concepto": {
          attributes: {
            "xmlns:z": "http://schemas.microsoft.com/2003/10/Serialization/",
            "z:Id": "i1",
          },
          "Id": {
            attributes: {
              "xmlns": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common"
            },
            $value: 7,
          },
        }
      }
    }
  }

  return client;
};

export const addOportunidad = (clientID, { executive, branch, value, description }, submitted_at) => {
  const oportunidad = {
    "oportunidad": {
      attributes: {
        "xmlns:a": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Oportunidades",
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns:z": "http://schemas.microsoft.com/2003/10/Serialization/",
        "z:Id": "i1",
      },
      "a:Cliente": {
        attributes: {
          "xmlns:b": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Figuras",
          "z:Id": "i2",
        },
        "Id": {
          attributes: {
            "xmlns": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common"
          },
          $value: clientID,
        },
        "b:Entidad": "2",
        "b:Estado": "1"
      },
      "a:Colaborador": {
        attributes: {
          "xmlns:b": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Figuras",
          "z:Id": "i3",
        },
        "Id": {
          attributes: {
            "xmlns": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common"
          },
          $value: 56,
        },
        "b:Estado": "3"
      },
      // TOMAS = 1, CATI = 2, MUGUEL = 3, GRACE = 4
      "a:Ejecutivo": {
        attributes: {
          "xmlns:b": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Figuras",
          "z:Id": "i5",
        },
        "Id": {
          attributes: {
            "xmlns": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common"
          },
          $value: executive, // 2
        },
        "b:Estado": "3"
      },
      "a:Ramo": {
        attributes: {
          "xmlns:b": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Productos",
          "z:Id": "i6",
        },
        "Id": {
          attributes: {
            "xmlns": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common"
          },
          $value: branch, // 28
        },
        "b:Naturaleza": 2
      },
      "a:FechaApertura": submitted_at, // "a:FechaApertura": "2021-03-02T00:00:00",
      // La fecha PREVISTA de cierre 15 días pasada la fecha de alta.
      "a:FechaPrevistaCierre": addDays(submitted_at, 15), // "a:FechaPrevistaCierre": "2021-07-01T00:00:00",
      "a:Importe": value,
      "a:Moneda": {
        attributes: {
          "xmlns:b": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.General",
          "z:Id": "i7",
        },
        "Id": {
          attributes: {
            "xmlns": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common"
          },
          $value: 2,
        }
      },
      "a:RiesgoDesc": description,
      "a:Tipo": {
        attributes: {
          "z:Id": "i32",
          "xmlns:b": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.General",
        },
        "Id": {
          attributes: {
            "xmlns": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common",
          },
          $value: 314,
        }
      }
    }
  };
  return oportunidad;
}

export const addDocument = ({ opID, pdfFileName, company }) => {
  const documentAliasArray = pdfFileName.split('.');
  documentAliasArray.splice(documentAliasArray.length - 1, 1);
  const documentAlias = documentAliasArray.join();

  const documento = {
    "archivoDocumentalDTO": {
      attributes: {
        "xmlns:a": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.General",
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns:z": "http://schemas.microsoft.com/2003/10/Serialization/",
        "z:Id": "i1",
      },
      "a:Alias": documentAlias,
      "a:CompName": company,
      "a:Nombre": pdfFileName,
      "a:ObjId": opID,
      "a:Objeto": 160,
      "a:Observaciones": "",
      "a:Path": "UNKNOWN"
    },
    "area": "VisualSEG",
    "type": "PDF",
    "origin": "INSURCEO",
    "properties": {
      attributes: {
        "i:nil": true,
        "xmlns:a": "http://schemas.microsoft.com/2003/10/Serialization/Arrays",
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance",
      }
    }
  };
  return documento;
};

export const uploadDocument = ({ fileName, documentID }) => {
  const contents = fs.readFileSync(fileName, { encoding: 'base64' });
  const documentoToUpload = {
    "idArchivoDocumental": documentID,
    "comment": {
      attributes: {
        "i:nil": true,
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance",
      }
    },
    "content": contents,
    "signature": {
      attributes: {
        "i:nil": true,
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance",
      }
    }
  }
  return documentoToUpload;
}

export const addCotizacion = ({ opportunityID, companyID, productID, value, submitted_at }) => {
  const cotizacion = {
    "oportunidadId": opportunityID,
    "cot": {
      attributes: {
        "xmlns:a": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Oportunidades",
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns:z": "http://schemas.microsoft.com/2003/10/Serialization/",
        "z:Id": "i1",
      },
      "a:Compania": {
        attributes: {
          "xmlns:b": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Productos",
          "z:Id": "i2",
        },
        "Id": {
          attributes: {
            "xmlns": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common",
          },
          $value: companyID,
        }
      },
      "a:Estado": 1,
      "a:PrimaAnual": value,
      "a:Producto": {
        attributes: {
          "xmlns:b": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Productos",
          "z:Id": "i4",
        },
        "Id": {
          attributes: {
            "xmlns": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Common",
          },
          $value: productID,
        }
      },
      "a:TotalReciboAnual": value,
      "a:FechaSolicitudCorreduria": submitted_at,
      "a:FormaPago": 1,
      "a:Situacion": 2
    },
  };
  return cotizacion;
};

export const addRiesgo = ({ opportunityID, name, description, submitted_at }) => {
  const riesgo = {
    "oportunidadId": opportunityID,
    "riesgoOportunidadDTO": {
      attributes: {
        "xmlns:a": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Oportunidades",
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance",
        "xmlns:z": "http://schemas.microsoft.com/2003/10/Serialization/",
        "z:Id": "i1",
      },
      "a:RiesgoOportunidadId": "",
    },
    "riesgoVariosDTO": {
      attributes: {
        "xmlns:a": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.Riesgos",
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance"
      },
      "a:DescripcionRiesgo": description,
      "a:NombreRiesgo": name,
      "a:Descripcion": description,
      "a:FechaAlta": submitted_at,
    },
  };
  return riesgo;
};

export const getElementGeneral = (tipo) => {
  const requestGen = {
    "aobRootName": tipo,
    "resultFields": {
      attributes: {
        "xmlns:d4p1": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.ReportManager",
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance"
      },
      "d4p1:SimpleResultField": {
        "d4p1:FieldPath": "Nombre"
      }
    },
    "filterFields": {
      attributes: {
        "xmlns:d4p1": "http://schemas.datacontract.org/2004/07/mpm.seg.ServiceModel.DTO.DataContracts.ReportManager",
        "xmlns:i": "http://www.w3.org/2001/XMLSchema-instance"
      },
      "d4p1:NexusType": "And",
      "d4p1:SimpleFilterNodes": {
        "d4p1:SimpleFilterNode": {
          attributes: {
            "i:type": "d4p1:SimpleFilterValue",
          },
          "d4p1:FieldModelPath": "Nombre",
          "d4p1:OperatorType": 16
        }
      },
    },
    "pageindex": "0",
    "maxRows": "20",
  };
  return requestGen;
};
