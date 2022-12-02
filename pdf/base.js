const IMG_URL = 'https://insurceo.s3-eu-west-1.amazonaws.com/images';
const GENERAL_IMG = `${IMG_URL}/cuestionario.png`; // imagen fondo respuestas
const CLIENT_IMG = `${IMG_URL}/datosCliente.png`; // imagen fondo respuestas

const LOGO_URL = `${IMG_URL}/logoAmarillo.png`;
const LOGO_URL_BLANCO = `${IMG_URL}/logoBlanco.png`;
const LOGO_URL_FOOTER = `${IMG_URL}/footer.png`;
const MAIL = `${IMG_URL}/mail.png`;
const TELEFONO = `${IMG_URL}/telefono.png`;
const NET = `${IMG_URL}/net.png`;
const WILLIS = `${IMG_URL}/logoWillis.png`;

/* const PRIMA_COVER = `${IMG_URL}/primaBackground.png`;*/

// const primaryColor = '#485172';
// const grayBlue = '#D9D9D9';
const yellow = '#FFE900';
const lightYellow = "#FCF6B6";

import { getTextFromLink, handleFields, capitalize, tempJoined, detailsJoined } from '../utils';
import conditions from './conditions';
import attributes from './attributes';
import summary from './summary';
import details from './details';

/**
 * 
 * Previo al display tenemos que crear la sección de answers 
 * ya que el número de páginas dependerá del número de respuestas
 * y tenemos que hacerlo a mano (sabiendo que caben aprox 7 por pagina)
 */

const renderSummary = (form, company) => {
  const summaryData = summary[form];
  let renderSummary = true;

  if (summaryData.companies) {
    if (!summaryData.companies.includes(company)) {
      renderSummary = false;
    }
  }

  if (renderSummary) {
    const values = summary[form];
    return /* html */`
    <div class="page">
      <img src="${LOGO_URL}" class="logo" />
      <div class="conditions">
        <div class="summary">
          <span class="title">${values.title}:</span>
          <div>${values.content}</div>
        </div>
      </div>
      <div class="sign">
        <div>
          <span class="bold">Nombre y apellidos de la persona que firma</span>: <span class="void"></span>
        </div>
        <div>
          <p>
            <span class="bold">Cargo</span>: <span class="void big"></span>
          </p>
          <p>
            <span class="bold">Fecha</span>: 
            <span class="void small"></span>/<span class="void small"></span>/<span class="void small"></span>
          </p>
        </div>
      </div>
    </div>
    `
  }

  return '';
}

const renderDetails = (form, company, { limit }) => {
  const detailID = `${form}-${company}`;
  const detail = details[detailID];
  if (detail !== undefined && typeof detail === 'function') {
    return detail({ limit });
  }

  return '';
}

const renderConditions = (form, company, joined) => {
  let renderLists = '';

  if (conditions[form]) {
    let conditionToUse = conditions[form];
    if (typeof conditionToUse === 'object' && !Array.isArray(conditionToUse)) {
      conditionToUse = conditionToUse[company];
    }


    if (conditionToUse !== undefined) {
      renderLists = conditionToUse.map((item) => {

        if (typeof item === 'string') {
          return (/* html */`<li>${item}</li>`)
        }

        if (typeof item === 'object') {
          return (/* html */`
            <li>
              <span>${item.title}</span>
              <ul>
              ${item.list.map((subItem) => /* html */`<li>${subItem}</li>`).join('')
            }
              </ul>
            </li>
          `)
        }

        return null;
      }).join('');
    }
  }

  return (
    /* html */`
  <p>Las condiciones de la presente oferta, son válidas siempre y cuando se cumplan, en relación al
  Asegurado, las siguientes condiciones:</p>
  <ul>
  ${renderLists}
  </ul>
  ${(detailsJoined.includes(`${form}-${company}`)) ?
      renderDetails(form, company, { limit: null }) :
      ''
    }
  ${(joined && details[`${form}-${company}`] === undefined) ?
    /* html */`
    <div class="links">
    ${attributes[form] && Object.keys(attributes[form]).map((item) => /* html */`
        <div class=${`attribute`}>
          <span class="title">${item}:</span>
          <div class=${form}>${attributes[form][item]}</div>
        </div>
      `).join('')
    }
    </div>
  ` :
      ''}

  
`);
}

const renderAttributes = (form, company) => (details[`${form}-${company}`] === undefined ?
/* html */`
  <div class="page">
    <img src="${LOGO_URL}" class="logo" />
    <div class="conditions">
      <div class="links">
      ${attributes[form] && Object.keys(attributes[form]).map((item) => /* html */`
          <div class="attribute">
            <span class="title">${item}:</span>
            <div>${attributes[form][item]}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  ` :
  '')

const renderWarning = () => /* html */`
<p>INSURNET S.L. le informa de la existencia de un fichero en el que se almacenan los datos facilitados
por el cliente con las finalidades expresadas en el punto anterior cumpliendo cuantas obligaciones
legales son exigibles al mismo de acuerdo con lo establecido en la legislación de datos de carácter
personal.</p>

<p>En relación con dicho fichero, el usuario podrá ejercer por escrito los derechos de acceso,
rectificación, cancelación y oposición, de estos datos.</p>

<p>Para ello deberá dirigirse mediante solicitud escrita y firmada a INSURNET S.L. Insurnet Barcelona
Rambla Catalunya 86 -1º 08008 – Barcelona y Insurnet Palma de Mallorca Via Sindicato 69, 7A
07002 – Palma de Mallorca.</p>

<p>Para cualquier otra consulta o aclaración adicional, por favor, no dude en ponerse en contacto con
nosotros y quedamos a la espera de su confirmación final.</p>
`;

const renderTerms = ({ productName, company, id }) => /* html */`
  <p>Siguiendo sus instrucciones solicitando condiciones de aseguramiento para la contratación de su póliza
  de seguro de <span>${productName}${'do' === id ?
  ' - RC para Administradores y Directivos' :
  ''}</span>, le comunicamos que procedemos a adjuntarle los detalles referidos únicamente a las
  condiciones de aseguramiento que le recomendamos contratar.</p>

  <p>Estas condiciones de aseguramiento se han obtenido tras valorar las necesidades de cobertura de seguro
  que nos comunicó; tras haber negociado con varios aseguradores la cobertura de seguro que usted requiere,
  le recomendamos la cobertura de <span>${capitalize(company)}</span>.</p>

  <p>Le informamos que hemos elegido las condiciones de aseguramiento, entre varios aseguradores a los que
  nos hemos dirigido para la cobertura que usted precisa. Por otra parte, le confirmamos que nada nos obliga
  a recomendar la cobertura con el asegurador que le hemos recomendado, y que, asimismo, nuestra elección
  de asegurador se basa en nuestro conocimiento y experiencia del mercado tras valorar las ofertas recibidas. 
  Si lo solicita, podremos facilitarle una lista completa de los aseguradores con los que hemos trabajado.</p>

  <p>Adjuntamos detalle de los términos de las condiciones de aseguramiento de la cobertura disponible de
  acuerdo con las condiciones de la póliza, que se acordarán en su momento y se le remitirán cuando se
  formalice. Le rogamos que preste atención a las exclusiones, garantías u otras condiciones que se establecen
  en la cotización adjunta.</p>

  <p>Asimismo, le rogamos analice las condiciones de aseguramiento para asegurarse de que refleja exactamente
  la cobertura, condiciones, límites y demás términos requeridos.</p>

  <p>Las presentes condiciones de aseguramiento serán válidas durante 15 días, y tras dicha fecha los
  aseguradores podrán retirarla o modificarla.</p>

  <p>En este momento, la presente carta no garantiza ningún compromiso por parte del asegurador respecto del
  otorgamiento de la cobertura de seguro, ni tampoco confirma la cobertura de seguro efectiva.</p>

  <p>Le comunicamos que la cotización de la prima provisional para su cobertura de seguro asciende a <span>{{value}}</span>
  de prima total.</p>

  <p>Las presentes condiciones de aseguramiento responden a la información que nos ha facilitado y sobre la
  que hemos trabajado tanto nosotros como los aseguradores. En caso de que no nos hubiera facilitado toda
  la información material pertinente, o si descubriera que la información proporcionada no es exacta, deberá
  notificárnoslo a la mayor brevedad posible a fin de reconfirmar con los aseguradores los términos de dicha
  cobertura. Queremos asimismo aprovechar esta oportunidad para recordarle la necesidad de facilitar toda
  aquella información que resulte fundamental para sus requisitos de cobertura o que pudiera influir en la
  decisión de los aseguradores respecto a la aceptación del riesgo, la conclusión de los términos aplicables
  y/o en el coste del seguro. La omisión de dicha información puede dar lugar a la cancelación de la póliza. Le
  recordamos que esta es una responsabilidad permanente a lo largo de todo el periodo del seguro.<p>`

module.exports = ({ answers, value, company, productName, indemnizacion, id }) => {
  const isJoined = (Object.keys(tempJoined).includes(id) && tempJoined[id]);

  let answersView = /* html */`
    <div class="page">
    <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
      <img src="${LOGO_URL}" class="logo" />
      <div class="answers-container">
        <div class="form-title">
          <span>Cuestionario {{productName}}</span>
        </div>
  `;

  answers.forEach((item) => { // tienen que ser las answers separadas from full fields
    if (Array.isArray(item)) {
      // cuestionario general
      answersView += /* html */ `
        <div class="general">
          <div class="background"></div>
          <div class="form">`;

      const filteredItems = item.filter((answer) => (0 < answer.fields.length));

      filteredItems.forEach((answer, indexQuestion) => {
        const { fields } = answer;
        let { title: questionTitle } = answer;
        let displayValue = null;
        displayValue = handleFields(fields[0]);

        if ((/\[\*/u).test(questionTitle)) {
          questionTitle = getTextFromLink(questionTitle);
        }
        const isSevenModule = (0 !== indexQuestion && 0 === (indexQuestion % 5));
        const remaining = filteredItems.length - indexQuestion - 1;

        if (isSevenModule && remaining > 1) {
          const size = (40 / 6) * remaining;
          const backgroundSize = remaining <= 5 ?
            `${size}% ${size}%` :
            '40% 40%';

          // nueva pagina
          answersView += /* html */`
            <div class="question">
              <span class="title">${questionTitle}</span>
              <div>
                <span class="answer">${displayValue}</span>
              </div>
            </div>
            </div>
            </div>
            </div>
            </div>
            <div class="page">
            <div class="header">
            <span class="circuloAmarillo"></span> 
            <span class="rectanguloAmarillo"></span>
            <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
          </div>
              <img src="${LOGO_URL}" class="logo" />
              <div class="answers-container">
                <div class="form-title">
                  <span>Cuestionario {{productName}}</span>
                </div>
                <div class="general">
                  <div class="background" style="background-size: ${backgroundSize}"></div>
                  <div class="form">
          `;
        } else {
          answersView += /* html */`
          <div class="question">
            <span class="title">${questionTitle}</span>
            <div>
              <span class="answer">${displayValue}</span>
            </div>
          </div>
          `;
        }
      });

      answersView += /* html */ `</div>
        </div></div></div>`;
    } else {
      // client
      answersView += /* html */ `
        <div class="page">
        <div class="header">
        <span class="circuloAmarillo"></span> 
        <span class="rectanguloAmarillo"></span>
        <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
      </div>
          <img src="${LOGO_URL}" class="logo" />
          <div class="answers-container">
            <div class="form-title">
              <span>Datos Personales</span>
            </div>
            <div class="client">
              <div class="background"></div>
              <div class="form">`;

      Object.keys(item).forEach((clientKey) => {
        const questionValue = item[clientKey];
        const displayValue = 'object' === typeof questionValue ?
          handleFields(item[clientKey]) :
          item[clientKey];

        answersView += /* html */ `
          <div class="question">
            <span class="title">${clientKey}</span>
            <div>
              <span class="answer">${displayValue}</span>
            </div>
          </div>
        `;
      });

      answersView += /* html */`
      </div>
      </div>
      </div>
      </div>
      `;
    }
  })

  return (/* html */`
<!doctype html>
  <html>
     <head>
        <meta charset="utf-8">
        <style>
          @font-face {
            font-family: 'InterB';
            font-display: swap;
            font-weight: 700;
            src: url('https://insurceo.s3-eu-west-1.amazonaws.com/fonts/inter.woff');
          }

           html, body {
            color: black;
            height: 100%;
            margin: 0;
            font-family: 'arial';
          }

          .wrapper {
            height: 100%;
            position: relative;
          }

          .general, .client {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 41px;
          }

          .background {
            background-size: 40% auto;
            background-position: center;
            background-repeat: no-repeat;
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: ${lightYellow};
          }

          .last {
            background-color: red;
          }

          .form {
            z-index: 2;
            position: absolute;
            height: auto;
            width: 100%;
            background-color: ${lightYellow};
            background-size: 40% auto;
            background-position: center;
            background-repeat: no-repeat;
          }

          .general .form {
            background-image: url(${GENERAL_IMG});
          }

          .client .form {
            background-image: url(${CLIENT_IMG});
          }

          .form-title {
            z-index: 4;
            position: absolute;
            top: 0;
            background-color: ${yellow};
            text-align: center;
            color: black;
            width: 100%;
            font-size: 16px;
            height: 40px;
            display: table;
            font-weight: bold;
          }

          .form-title span {
            display: table-cell;
            vertical-align: middle;
          }
          .answers-container {
            position: relative;
            top: 14%;
            
            left: 10%;
            width: 80%;
          }

          .question {
            border-bottom: 2px dotted black;
            padding: 30px;
            color: black;
            opacity: 1;
            line-height: 10px;
          }

          .question .title {
            font-size: 10px;
            font-family: 'InterB';
          }

          .question .answer {
            font-size: 9px;
            
          }

          .page {
            page-break-after: always;
            position: relative;
            height: 100%;
          }

          .cover {
            background-color: ${yellow};
            background-size: cover;
          }

          .logo {
            position: absolute;
            top: 2.8%;
            min-width: 18%;
            width: 18%;
            height: auto;
            right: 1.5%;
            padding: 2%;
            z-index: 10;
            margin-left: auto;
          }

          .left {
            left: 8%;
            right: auto;
          }

          .big {
            width: 55%;
            height: auto;
            top: 3%;
          }

          .boxShadow {
            background-color: ${yellow};
            border: 3px solid white;
            position: absolute;
            top: 25%;
            right: 9%;
            width: 53%;
            height: 29.5%;
            z-index: 2;
          }

          .box {
            display: table;
            text-align: center;
            border-radius: 30px;
            z-index: 3;
            box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
          }

          .white {
            background-color: white;
          }

          .absolute {
            position: absolute;
          }

          .box p {
            vertical-align: middle;
          }

          .title {
            top: 24%;
            right: 8%;
            width: 53%;
            height: 30%;
          }

          .title .primary {
            margin-top: 25%;
            margin-bottom: -5%;
            font-family: 'InterB';
          }

          .primary {
            color: black;
          }

          .offer {
            bottom: 15%;
            left: 23%;
            width: 55%;
            height: 10%;
            font-family: 'InterB';
          }
          .offer-title {
            left: 23%;
            width: 55%;
            font-family: 'InterB';
          }

          .capital-text {
            font-size: 30px;
            text-transform: uppercase;
          }

          .offer .capital-text {
            margin: 0;
            margin-top: 3%;
          }

          .value-title {
            font-family: 'InterB'
          }

          .prime-values {
            position: absolute;
            height: 56%;
            text-align: center;
            width: 88%;
            top: 25%;
            left: 6%;
            color: black;
            background-size: cover;
            background-repeat: no-repeat;
          }

          .prime-values h2 {
            font-size: 38px;
            margin-top: 10px;
            margin-bottom: 12px;
          }

          .blue {
            background-color: ${lightYellow};
          }

          .terms {
            position: absolute;
            height: 100%;
            width: 80%;
            top: 12%;
            left: 10%;
          }

          .terms p {
            font-size: 10px;
            line-height: 1.4;
            text-align: justify;
            padding: 10 0;
          }

          .row {
            text-align: center;
            height: 60px;
          }
          .footer {
            color: black;
            font-size: 14px;
          }
          .footer-page{
            background-color: #FFE900;
          }

          .footer span {
            font-family: 'InterB';
          }

          .row p {
            margin-top: 3px;
            margin-bottom: 3px;
            font-size: 16px;
          }

          img.footer-logo {
            min-width: 60%;
            width: 560px;
            height: auto;
            margin-top: 15px;
          }

          .footer .main-img {
            margin-top: 210px;
            height: 36%;
            min-height: 36%;
            width: 100%;
          }

          img.icon {
            width: 40px;
            min-width: 4%;
            margin: 0 20px;
            height: 40px;
          }

          .prime-box {
            color: black;
            margin-left: auto;
            margin-right: auto;
            text-align: left;
            width: 70%;
          }

          .prime-box h2 {
            text-align: center;
          }

          .prime-box p {
            padding: 1.5% 3%;
          }

          .prime-shadow {
            background-color: #485172;
            position: absolute;
            bottom: 22%;
            left: 17%;
            width: 69%;
            height: 15%;
            z-index: 1;
          }

          .prime-value {
            height: 100%;
            text-align: center;
            height: 15%;
            display: table;
            width: 70%;
            left: 15%;
            bottom: 23%;
          }

          .prime-value p {
            vertical-align: middle;
            display: table-cell;
          }

          .total-title {
            font-size: 30px;
            text-align: center;
          }


          .total-title, .prime-values h2 {
            font-family: 'InterB';
          }

          .conditions {
            position: absolute;
            top: 12%;
            font-size: 10.5px;
            margin-left: auto;
            margin-right: auto;
            line-height: 15px;
            left: 0;
            right: 0;
            width: 80%;
          }

          .conditions ul {
            padding-left: 20px;
          }

          .centered {
            margin-left: auto;
            margin-right: auto;
            left: 0;
            right: 0;
            position: absolute;
            top: 10%;
            width: 80%;
          }

          .centered.full-width {
            width: 85%;
          }

          .details {
            font-size: 12px;
          }


          .align-right {
            text-align: right;
            padding-right: 20px;
          }

          .details .bold {
            line-height: 16px;
          }

          .details ol li {
            margin-left: 0px;
          }

          .details ol li {
            margin: 12px;
            width: 100%;
            display: flex;
          }

          .details ol li p {
            width: 99vw;
          }

          .details h4 {
            margin-top: 5%;
          }

          .details ol li div {
            top: -12px;
            width: 85%;
            right: 0;
          }

          .detailGray {
            text-transform: uppercase;
            padding: 2% 0%;
          }

          .grayBorder {
            border: 1px solid lightgray;
            font-weight: bold;
            padding: 1% 0%;
          }

          .underlined {
            text-decoration: underline;
          }

          .links {
            margin-top: 20px;
          }

          .attribute {
            width: 100%;
            margin-bottom: 15px;
            display: table;
          }


          .attribute .title, .summary .title {            
            border-bottom: 1px solid ${lightYellow};
          }

          .summary {
            font-size: 10px;
            top: 6%;
          }

          .summary ul.normal {
            display: table;
            margin-top: 0px;
            margin-bottom: 0px;
            padding-left: 0px;
          }

          .summary ul.normal > li {
            display: table-row;
            width: 100%;
          }

          .summary ul.normal li > span:first-child {        
            width: 40%;
            text-align: right;
            padding-right: 15px;
          }

          .tabbed {
            padding-left: 10px;
          }

          .tabbed.extra {
            padding-left: 20px;
          }

          .checkbox-text {
            padding-left: 1.5em;
            font-size: 10px;
          }

          .checkbox {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: lightgray;
            vertical-align: center;
            bottom: 15%;
          }

          .summary ul.wide li > span:first-child {
            width: 15%;
            text-align: right;
          }

          .summary ul.normal > li > span {
            display: table-cell;
          }

          .summary ul.normal > li > p {
            margin-top: 1px;
            margin-bottom: 1px;
          }

          .roman > li {
            list-style-type: lower-roman;
            margin-bottom: 5px;
          }

          .letter-list {
            list-style-type: lower-alpha;
          }

          .small-text {
            font-size: 10px;
          }

          .normal-text {
            font-weight: normal;
          }

          .summary div {
            margin-top: 15px;
          }

          .attribute div {
            width: 80%;
            display: table-cell;
            font-size: 11px;
          }

          .attribute div.rcp, .attribute div.do {
            width: 60%;
          } 

          .bold {
            font-weight: bold;
          }

          .col-align {
            display: table;
          }

          .col-align div {
            display: table-row;
            height: 40px;
          }

          .col-align ul {
            margin-top: 5px;
            list-style-type: none;
          }

          .sign {
            position: absolute;
            bottom: 10%;
            border: 1px solid #444;
            font-size: 11px;
            padding: 1px;
            margin-left: auto;
            margin-right: auto;
            left: 0;
            width: 80%;
            right: 0;
            border-radius: 2px;
            display: table;
          }

          .sign > div {
            width: 100%;
            margin: 15px 2px;
          }

          .sign > div > p {
            display: table-cell;
            width: 72%;
          }

          .void {
            content: "";
            display: inline-block;
            border-bottom: 1px solid #444;
            box-shadow: none;
            width: 48%;
            height: 1px;
          }

          .small {
            width: 25px;
            margin: 0px 2px;
          }

          .big {
            width: 250px;
          }

          .margin-top {
            margin-top: 19%;
          }

          .margin-left {
            margin-left: 10%;
          }

          .detail-title {
            margin-left: 7%;
          }

          .limit {
            display: table;
            width: 100%;
          }

          .limit-title {
            display: table-cell;
            width: 35%;
          }

          .limit-value {
            display: table-cell;
            width: 50%;
            padding-left: 5%;
          }

          .markel-title {
            color: black;
            font-weight: bold;
          }

          .markel-medium {
            font-size: 12px;
          }

          .markel-big {
            font-size: 16px;
          }

          .markel-list {
            list-style-type: none;
            /*use padding to move list item from left to right*/
            padding-left: 2em;
          }

          .markel-list li:before {
            content: "–";
            position: absolute;
            /*change margin to move dash around*/
            margin-left: -1em;
          }

          .markel-sign-box {
            margin-top: 3em;
          }

          .markel-sign-box .limit {
            margin-bottom: 2em;
          }

          .markel-sign-box .limit-title {
            width: 20%;
            padding-left: 2em;
          }

          .markel-sign-box .limit-value {
            width: 80%;
            padding: 1em 2em;
          }

          .markel-sign-box .limit.tall {
            margin-bottom: 4em;
          }

          .tall .limit-value {
            height: 50px;
          }

          .sign-box {
            padding: 1em;
            width: 50%;
            border: 1px solid black;
          }

          .horizontal {
            width: 100%;
            display: table;
          }

          table {
            border: 1px solid black;
            border-collapse: collapse;
            font-size: 11px;
          }

          table tr {
            border: 1px solid black;
          }

          table tr td {
            position: relative;
            border: 1px solid black;
            padding: 0em 1em;
            line-height: 1em;
          }

          table tr td.row-value {
            text-align: center;
          }

          table tr td.row-title {
            width: 70%;
          }

          .center {
            text-align: center;
          }

          .dot {
            position: absolute;
            background-color: black;
            border: 1px solid black;
            width: 1px;
            height: 1px;
            left: 0.5em;
            top: 0.3em;
            border-radius: 2em;
          }

          .dot-value {
            padding-left: 1.5em;
          }

          .boolBox {
            position: relative;
            width: 150px;
            height: 20px;
          }

          .marginBox {
            margin: 10px;
          }

          .boolBox.inline {
            display: inline-block;
            left: 45%;
            top: 7px;
            vertical-align: middle;
          }

          .boolBox .bool-text  {
            padding: 5px;
            height: 20px;
            vertical-align: middle;
            display: inline-block;
          }

          .checkbox-item {
            position: absolute;
            width: 20px;
            height: 20px;
            background-color: lightgray;
          }

          .header p{
            position: absolute;
            left: 15%;
            top: 3.8%;
            color: black ;
            font-size: 9pt;
            z-index: 12;
          }
          .circuloAmarillo {
            z-index: 10;
            position: absolute;
            width: 60px;
            height: 60px;
            left: 5%;
            top: 2%;
            -moz-border-radius: 50%;
            -webkit-border-radius: 50%;
            border-radius: 50%;
            background: #FFF15E;
          }

          .rectanguloAmarillo {
            z-index: 11;
            position: absolute;
            left: 10%;
            top: 6%;
            width: 320px;
            height: 12px;
            background: ${yellow};
          }

          .rectanguloBlanco {
            z-index: 11;
            position: absolute;
            left: 10%;
            top: 6%;
            width: 320px;
            height: 12px;
            background: white;
          }
          .footer-location {
            font-size: 50px;
          }
          .footer-info {
            position: absolute;
            text-align: left;
            font-size: medium;
            left: 10%;
            bottom: 6%;
          }
          .footer-left {
            position: absolute;
            right: 10%;
            bottom: 2%;
            width: 180px;
          }

        </style>
     </head>
     <body>
        <div class="wrapper">
          <div class="page cover">
            <div class="header">
              <span class="circuloAmarillo"></span> 
              <span class="rectanguloBlanco"></span>
              <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
            </div>
            <img class="logo right" src="${LOGO_URL_BLANCO}">
            <div class="box name title absolute white offer-title">
              <p class="primary capital-text">{{productName}}</p>
              <p>{{clientName}}</p>
            </div>
            <div class="box absolute white offer">
              <p class="capital-text">OFERTA DE SEGURO</p>
              <span>{{date}}</span>
            </div>
          </div>
          <div class="page">
            <div class="header">
              <span class="circuloAmarillo"></span> 
              <span class="rectanguloAmarillo"></span>
              <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
            </div>
            <img src="${LOGO_URL}" class="logo" />
            <div class="prime-values">
              <div class="box white prime-box">
                <h2>OFERTA</h2>
                <p>
                   <span class="value-title">Tomador: </span><span class="value"> {{clientName}}</span>
                </p>
                <p>
                   <span class="value-title">Fecha: </span><span class="value"> {{date}}</span>
                </p>
                <p>
                   <span class="value-title">Límite de indemnización: </span><span class="value"> {{indemnizacion}}</span>
                </p>
                <h2>PRIMA TOTAL</h2>
                <p class="total-title">{{value}}</p>
              </div>
            </div>
          </div>

          ${answersView}

          <div class="separator"></div>
          <div class="page">
          <div class="header">
            <span class="circuloAmarillo"></span> 
            <span class="rectanguloAmarillo"></span>
            <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
          </div>
            <img src="${LOGO_URL}" class="logo" />
            <div class="terms">
            ${renderTerms({ productName, company, value, id })}
            </div>
          </div>

          <div class="page">
          <div class="header">
            <span class="circuloAmarillo"></span> 
            <span class="rectanguloAmarillo"></span>
            <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
          </div>
            <img src="${LOGO_URL}" class="logo" />
            <div class="terms">
            ${renderWarning()}
            </div>
          </div>

          <div class="page">
          <div class="header">
            <span class="circuloAmarillo"></span> 
            <span class="rectanguloAmarillo"></span>
            <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
          </div>
            <img src="${LOGO_URL}" class="logo" />
            <div class="conditions">
              ${renderConditions(id, company, (Object.keys(tempJoined).includes(id) && tempJoined[id]))}
            </div>
          </div>

          ${!isJoined ?
      renderAttributes(id, company) :
      ''}

          ${!detailsJoined.includes(`${id}-${company}`) ?
      renderDetails(id, company, { limit: indemnizacion }) :
      ''
    }
          
          ${renderSummary(id, company)}
          
          <div class="page footer-page">
            <div class="footer">
              <div class="row">
                <img src="${LOGO_URL_FOOTER}" class="footer-logo" />
                <p class="footer-location">PALMA · BARCELONA · MADRID</p>
              </div>
              <div class="row footer-info">
                <p><img src="${NET}" style="max-width: 3%;" /> &nbsp;www.insurceo.com </p>
                <p><img src="${TELEFONO}" style="max-width: 3%;" /> &nbsp;697 43 07 30 </p>
                <p><img src="${MAIL}" style="max-width: 3%;" /> &nbsp;info@insurceo.com</p>

                <img src="${WILLIS}" class="footer-left" />
              </div>
            </div>
          </div>
        
        
        </div>
     </body>
  </html>
  
  `
  );
}
