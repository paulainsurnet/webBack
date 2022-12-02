import PDF from 'handlebars-pdf';
import PDFGenerator from './base';
import { formatCurrency } from '../utils';

const handler = async (data, id) => {
  const {
    title,
    clientName,
    email,
    date,
    company,
    productName,
    value,
    indemnizacion,
    form
  } = data;

  console.log(form, company);

  let document = {
    template: PDFGenerator({...data, title: title.toLowerCase(), id }),
    options: { border: 0 },
    context: {
      title,
      productName,
      clientName,
      value: formatCurrency(value),
      indemnizacion: formatCurrency(indemnizacion),
      date: new Date(date).toLocaleDateString('es', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    },
    path: `./public/base-${title}-${company}-${email}.pdf`.toLowerCase()
  }

  return PDF.create(document)
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch(error => {
      console.error(error)
    })
}

export default handler;
