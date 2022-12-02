import { 
  excelParser,
  indemnizationOnlyParser,
  multipleChoiceParser, 
  numberParser 
} from './utils';


export default {
  "defaultParser": { forXlsx: true, parser: excelParser },
  "indemnizationOnlyParser": { forXlsx: true, parser: indemnizationOnlyParser },
  "multipleChoiceParser": { forXlsx: false, parser: multipleChoiceParser },
  "numberParser": { forXlsx: false, parser: numberParser }
}
