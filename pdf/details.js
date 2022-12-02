const IMG_URL = 'https://insurceo.s3-eu-west-1.amazonaws.com/images';
const LOGO_URL = `${IMG_URL}/logoAmarillo.png`;

import { formatCurrency, generateTable } from '../utils';

const boolBox = (inline) => /* html */`
  <div class="boolBox ${inline ?
    'inline' :
    'marginBox'}">
    <span class="bool-text">SI</span><span class="checkbox-item" style="left: 15%"></span>
    <span class="bool-text" style="padding-left: 40px">NO</span><span class="checkbox-item" style="left: 58%"></span>
  </div>
`;

const block = (title, value) => /* html */`
  <li>
    <span class="bold">${title}:</span>
    <span>${value}</span>
  </li>
`;

const subLimit = (content, custom) => {
  let additionalData = '';

  if (custom) {
    additionalData = content;
  } else if (Array.isArray(content)) {
    content.forEach((item) => {
      additionalData = /* html */`
        ${additionalData}
        <p class="limit"><span class="limit-title bold">${item[0]}:</span> <span class="limit-value">${item[1]}</span></p>
      `;
    })
  } else {
    throw new Error('Bad use of subLimit: Content is not custom nor array.')
  }

  return /* html */`
    <div class="grayBorder">Sublímites</div>
    ${additionalData}
  `;
}

const defaultDetails = ({ limit }) => {
  const formattedLimit = formatCurrency(limit);
  const franquiciaValue = (limit >= 300000 ?
    '1000' :
    '500') + ' €';

  return (/* html */`
    <div class="page details">
      <div class="header">
        <span class="circuloAmarillo"></span> 
        <span class="rectanguloAmarillo"></span>
        <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
      </div>
      <img src="${LOGO_URL}" class="logo" />
      <div class="centered">
        <h3 class="detailGray">Detalles de cobertura específicos al módulo de cobertura</h3>
        <span>El límite agregado abajo indicado es el importe máximo aplicable para el conjunto de lo(s)
        módulo(s): A</span>

        <p><span class="bold">Límite agregado:</span> ${formattedLimit}</p>
        <h4 class="underlined">A CYBERCLEAR</h4>
        <div>
          <h4 class="detail-title underlined">A.1 SERVICIOS DE RESPUESTA A INCIDENTES</h4>
          <ol>
            ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
            ${block('Franquicia', franquiciaValue)}
            ${block('Ámbito territorial', 'Mundial')}
            ${block('Suplementos', /* html */`
                <div>
                  <ol>
                    <li>
                      <span class="bold">HCC360 - Franquicia (Servicio de Respuesta a Incidentes)</span>
                      La franquicia aplicará o no conforme a lo indicado en “Franquicia y
                      uso de proveedores fuera del Panel de Expertos”.
                    </li>

                    <li>
                      <span class="bold">HCC360 – Contacto en caso de incidente</span>
                      En caso de un incidente, contacte con el CyberSoc de Deloitte
                      disponible 24x7x365 al teléfono: +34 910 386 819
                      Consulte el Anexo “<span class="bold">Servicio de respuesta a incidentes (Cobertura
                      2.1)</span>” de las Condiciones Especiales para más información.
                    </li>
                  </ol>
                </div>
            `)}
          </ol>

          <h4 class="detail-title underlined">A.2 GASTOS DE MITIGACIÓN</h4>
          <ol>
            ${block('Límite de indemnización', '40.000 € por incidente y periodo de seguro')}
            ${block('Franquicia', '')}
            ${block('Ámbito territorial', 'Mundial')}
            ${block('Suplementos', /* html */`
                <div>
                  <ol>
                    <li>
                      <span class="bold">HCC360 - Aclaración de Límite</span>
                      A efectos de la aplicación de la cobertura de “Gastos de
                      Mitigación” el límite de indemnización indicado en el apartado
                      A.2 no será de aplicación cuando el mismo se use a efectos de
                      la cobertura 2.2.b Pérdida de Beneficios, por lo que el límite de
                      indemnización máximo a pagar será el contratado para dicha
                      cobertura.
                    </li>
                  </ol>
                </div>
            `)}
          </ol>
        </div>
      </div>
    </div>

    <div class="page details">
    <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
      <div class="centered">
        <h4 class="detail-title underlined">A.3 PÉRDIDA DE BENEFICIOS</h4>
        <ol>
          ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
          ${block('Franquicia', '9 horas franquicia temporal')}
          ${block('Ámbito territorial', 'Mundial')}
        </ol>
  
        ${subLimit([['Periodo de indemnización', '120 días']])}        

        <h4 class="detail-title underlined">A.4 PROVEEDOR EXTERNO TECNOLÓGICO</h4>
        <ol>
          ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
          ${block('Franquicia', '10 horas franquicia temporal')}
          ${block('Ámbito territorial', 'Mundial')}
          ${block('Suplementos', /* html */`
            <div>
              <ol>
                <li>
                  <span class="bold">HCC360 - Aclaración franquicia Proveedor Externo Tecnológico</span>
                  <p>Adicionalmente será de aplicación para los “<span class="bold">Gastos de
                  Mitigación</span>” y “<span class="bold">Gastos de Recuperación de Datos y
                  Sistemas</span>” de la presente cobertura “<span class="bold">Proveedor Externo
                  Tecnológico</span>”, las <span class="bold">franquicias</span> indicadas en los apartados 2
                  y 6 del módulo “CYBERCLEAR” de las Condiciones
                  Particulares.</p>
                </li>
              </ol>
            </div>
          `)}
        </ol>

        ${subLimit([['Pérdida de beneficios - Proveedor externo Tecnológico', '120 días']])}

        <h4 class="detail-title underlined">A.5 EXTORSIÓN CIBERNÉTICA</h4>
        <ol>
          ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
          ${block('Franquicia', franquiciaValue)}
          ${block('Ámbito territorial', 'Mundial')}
        </ol>
      </div>
    </div>

    <div class="page details">
    <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
      <div class="centered">
        <h4 class="detail-title underlined">A.6 GASTOS DE RECUPERACIÓN DE DATOS Y SISTEMAS</h4>
        <ol>
          ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
          ${block('Franquicia', franquiciaValue)}
          ${block('Ámbito territorial', 'Mundial')}
        </ol>

        <h4 class="detail-title underlined">A.7 PROTECCIÓN DE EQUIPOS</h4>
        <ol>
          ${block('Límite de indemnización', '40.000 € por incidente y periodo de seguro')}
          ${block('Franquicia', '1.000 € por incidente')}
          ${block('Ámbito territorial', 'Mundial')}
        </ol>

        <h4 class="detail-title underlined">A.8 RESPONSABILIDAD TECNOLÓGICA</h4>
        <ol>
          ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
          ${block('Franquicia', franquiciaValue)}
          ${block('Ámbito territorial', 'Mundial')}
          ${block('Jurisdicción aplicable', 'Todo el mundo excepto USA/Canadá')}
        </ol>

        ${subLimit([['Sanciones administrativas', '100% de Responsabilidad Tecnológica'], ['Sanciones - PCI', '75.000 € por sanción y periodo de seguro']])}

        <h4 class="detail-title underlined">A.9 FRAUDE TECNOLÓGICO</h4>
        <ol>
          ${block('Límite de indemnización', '25.000 € por ciberataque y periodo de seguro')}
          ${block('Franquicia', `${franquiciaValue} por ciberataque`)}
          ${block('Ámbito territorial', 'Mundial')}
        </ol>
      </div>
    </div>

    <div class="page details">
    <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
      <div class="centered bold">
        <h3 class="detailGray">SUPLEMENTOS - Aplicables a póliza</h3>
        <p>1. HCC360 - Cláusula de Agravación de Riesgo</p>
        <p>
        1. La aseguradora ha suscrito el contrato considerando el estado de los riesgos y en
base a la información comunicada por el tomador y/o asegurado con carácter previo a
la contratación. Todas estas informaciones han sido valoradas como elementos
esenciales para aceptar la cobertura, estimar la prima y fijar las obligaciones entre las
partes. Si estas informaciones no fueran correctas, completas o exactas, el contrato
no se hubiera suscrito o se hubiera aceptado en otras condiciones más gravosas.
        </p>

        <p>2. El tomador del seguro o el asegurado deberán durante la vigencia del contrato</p>
        <p>
        comunicar al asegurador, tan pronto como les sea posible, la alteración de los factores
y las circunstancias declaradas y/o que agraven el riesgo.
        </p>

        <p>
        Entre otros que pudieran ser constitutivos de un aumento del riesgo, se considerarán en
todo caso factores o circunstancias que agravan el riesgo y que, por tanto, el tomador
y/o asegurado debe comunicar a la aseguradora, en función del cuestionario de riesgo
que hubiere cumplimentado, los siguientes, cuando la entidad:
        </p>

        <ul>
          <li>Tuviera ingresos brutos anuales consolidados o en su defecto de todos los
          asegurados superiores al 20%de los declarados ante la autoridad fiscal en el último
          año.</li>
          <li>Realizase una actividad distinta, o prestase a terceros un nuevo servicio en remoto o
          desde la nube.</li>
          <li>Hiciese uso de sistemas informáticos sin soporte del fabricante.</li>
          <li>Aplicara los parches (o actualizaciones) del fabricante a los sistemas en una
          frecuencia superior a 30 días, o de 45 días en caso de realizar comprobaciones en
          entornos de prueba previas a la aplicación de la actualización.</li>
          <li>Haya dejado de usar doble factor de autenticación para el acceso remoto o para el
correo electrónico web.</li>
          <li>Haya dejado de dar acceso a sus empleados únicamente a la información y sistemas
          que requieren para desarrollar sus funciones, y haya dejado de eliminar el acceso a
          sus sistemas e información a sus empleados, cuando dejan de serlo.</li>
          <li>y en relación con las copias de seguridad, cuando haya empeorado la gestión de las
          mismas (sin animo limitativo, su frecuencia, los medios que utiliza, si hace copia de
          todo o no, si ha bajado el número de copias realizadas).</li>
        </ul>
      </div>
    </div>

    <div class="page details">
    <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
      <div class="centered bold">
      <p>3. La aseguradora puede, en un plazo de dos meses a contar del día en que la agravación
      le ha sido declarada, proponer una modificación del contrato incluyendo cualquiera de
      las condiciones, limites garantías o coberturas contratadas, la prima o cualquier otro
      termino acordado.</p>

      <p>En tal caso, el tomador dispone de quince días a contar desde la recepción de esta
      proposición para aceptarla o rechazarla.</p>

      <p>En caso de rechazo, o de silencio por parte del tomador, la Aseguradora puede,
      transcurrido dicho plazo, rescindir el contrato previa advertencia al tomador, dándole
      para que conteste un nuevo plazo de quince días, transcurridos los cuales y dentro de
      los ocho siguientes comunicará al tomador la rescisión definitiva.</p>

      <p>4. La aseguradora también podrá optar por rescindir el contrato comunicándolo por
      escrito al asegurado dentro de un mes, a partir del día en que tuvo conocimiento de la
      agravación del riesgo.</p>

      <p>En el caso de que el tomador del seguro o el asegurado no haya efectuado su
      declaración y sobreviniere un incidente, la aseguradora queda liberada de su prestación
      si el tomador o el asegurado ha actuado con mala fe. En otro caso, incluyendo en
      aquellos casos en que no hubiera transcurrido el plazo de dos meses indicado en el
      párrafo (3) o si el tomador o asegurado no hubieran aceptado y cumplido las
      obligaciones de pago u otras exigidas por la aseguradora, la prestación de la
      aseguradora se reducirá proporcionalmente a la diferencia entre la prima convenida y la
      que se hubiera aplicado de haberse conocido la verdadera entidad del riesgo.</p>

      <p>2. HCC360- Información importante para la cobertura</p>
      <p>1. Conforme se dispone en las Condiciones Especiales, la póliza no cubre ningún
      problema preexistente, entendido como:</p>

      <p>Cualquier hecho, circunstancia o incidente de la que tuviera conocimiento el asegurado
      con anterioridad al inicio del primer periodo de seguro. Cualquier procedimiento
      civil, mercantil, penal, laboral, administrativo, regulatorio o de arbitraje, o cualquier
      procedimiento alternativo de resolución de conflictos iniciado con anterioridad a la
      primera fecha de efecto de la presente póliza, o basado en los mismos o esencialmente
      los mismos hechos alegados en dicho procedimiento anterior.</p>
      </div>
    </div>

    <div class="page details">
    <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
      <div class="centered bold">
        <p>2. Ámbito Temporal</p>
        <p>En relación con las coberturas de la presente póliza, se otorga cobertura únicamente a
        los incidentes descubiertos y notificados a la aseguradora durante el periodo de seguro.</p>
        <p>Adicionalmente, en relación con las coberturas de la sección 2.3 Responsabilidad
        Tecnológica, y siempre que las misma figure en las condiciones particulares, se otorga
        cobertura a las reclamaciones presentadas contra el asegurado durante el periodo de
        seguro o periodo adicional de notificación, independientemente de la fecha de
        ocurrencia del incidente, pero siempre y cuando el incidente haya sido descubierto y
        notificados durante el periodo de seguro.</p>
        <p>3. Cualquier falsedad o inexactitud en la cumplimentación del cuestionario puede llevar
        a la compañía aseguradora, conforme dispone la legislación aplicable, a rechazar los
        siniestros comunicados en la póliza o a reducir considerablemente la indemnización que
        corresponda.</p>
      </div>
    </div>
  `)
};

export default {
  'cyber-hiscox': defaultDetails,
  'rcp-hiscox': ({ limit }) => {
    const formattedLimit = formatCurrency(limit);
    const franquiciaValue = '300 €';

    return (/* html */`
      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered">
          <h3 class="detailGray">Detalles de cobertura específicos al módulo de cobertura</h3>
          <span>El límite agregado abajo indicado es el importe máximo aplicable para el conjunto de lo(s)
          módulo(s): A</span>
  
          <p><span class="bold">Límite agregado:</span> ${formattedLimit}</p>
          
          <h4 class="underlined">A RESPONSABILIDAD CIVIL PROFESIONAL</h4>
          <div>
            <h4 class="detail-title underlined">A.1 RESPONSABILIDAD CIVIL PROFESIONAL</h4>
            <ol>
              ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
              ${block('Franquicia', franquiciaValue)}
              ${block('Ámbito territorial', 'Mundo excepto USA/Canada')}
              
              
              ${block('Suplementos', /* html */`
                  <div>
                    <ol>
                      <li>
                        <p class="bold">Gastos de Asistencia Psicologica</p>
                        <p>Nosotros nos haremos cargo de los gastos de asistencia psicológica
                        derivados
                        directamente de una reclamación presentada en contra de un asegurado,
                        siempre que sea una persona física.
                        Nosotros abonaremos las pérdidas cubiertas en la presente extensión
                        hasta un sublímite de indemnización de 30.000€ por reclamación y año.
                        A los efectos de la presente extensión se acuerda expresamente que se
                        considerará de aplicación la franquicia establecida en las Condiciones
                        Particulares</p>
                      </li>
  
                      <li>
                        <p class="bold">Gastos de Asistencia a Juicio</p>
                        <p>En el caso de que las personas descritas en los apartados a y b siguientes
                        asistan a juicio en calidad de testigos, en un pleito relacionado con una
                        reclamación notificada y cubierta bajo la presente póliza, nosotros
                        abonaremos una compensación en base a las siguientes tarifas diarias, para
                        cada uno de los días durante los cuales la asistencia a juicio se requiera:</p>
                        <ol class="letter-list">
                          <li>Para cualquier gerente, socio o directivo que esté incluido en la
                          definición de asegurado: 360 €</li>
                          <li>Para cualquier empleado que esté incluido en la definición de
                          asegurado: 360 €</li>
                        </ol>

                        <p>La compensación a pagar bajo la presente extensión será en adición al
                        límite de indemnización establecido en el presente contrato.</p>
                      </li>
                    </ol>
                  </div>
              `)}
            </ol>
          </div>
        </div>
      </div>

      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered">
          <div>
            <ol class="margin-left" start="3">
              <li>
                <p class="bold">Gastos de Inhabilitación Profesional</p>
                <p>Se garantiza el pago de una indemnización mensual en el supuesto de que
                el asegurado
                sea condenado por sentencia judicial firme en un procedimiento penal, a la
                pena de inhabilitación especial para el ejercicio de la profesión, de acuerdo
                con lo establecido en el vigente Código Penal y siempre que se cumplan los
                siguientes requisitos:</p>
                <ul>
                  <li>Que el procedimiento judicial se siga con motivo del ejercicio
                  profesional</li>
                  <li>Que la condena al asegurado sea consecuencia de una imprudencia
                  profesional</li>
                </ul>

                <p>La suma asegurada para la presente cobertura queda establecida en un
                máximo de 2.500,00 euros al mes por cada asegurado hasta un máximo de
                12 meses. Esta renta no podrá sobrepasar en ningún caso los ingresos
                medios mensuales obtenidos por el asegurado en el ejercicio de la profesión
                durante los últimos doce meses inmediatamente anteriores a la condena.</p>
              </li>

              <li>
                <p class="bold">Fecha de retroactividad</p>
                <p>Un año antes de la fecha de efecto.</p>
              </li>

              ${subLimit([['Infidelidad de empleados', '150.000 € por reclamación y anualidad']])}
            </ol>
          </div>
          <h4 class="underlined">B RESPONSABILIDAD CIVIL GENERAL</h4>
          <div>
            <h4 class="detail-title underlined">B.1 RESPONSABILIDAD CIVIL EXPLOTACIÓN</h4>
            <ol>
              ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
              ${block('Franquicia', franquiciaValue)}
              ${block('Ámbito territorial', 'Mundo excepto USA/Canada')}
              ${block('Jurisdicción aplicable', 'Todo el mundo excepto reclamaciones en USA/Canadá')}
            </ol>

            ${subLimit(`<p class="limit tabbed"><span class="limit-title bold">Vehículos e efectos personales de empleados o visitantes:</span><span class="limit-value">150.000 € por reclamación y anualidad</span></p>`, true)}
          </div>
        </div>
      </div>

      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered">
          <h4 class="detail-title underlined">B.2 RESPONSABILIDAD CIVIL PATRONAL</h4>
          <ol>
            ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
            ${block('Franquicia', franquiciaValue)}
            ${block('Ámbito territorial', 'Mundo excepto USA/Canada')}
            ${block('Jurisdicción aplicable', 'Todo el mundo excepto reclamaciones en USA/Canadá')}
          </ol>

          ${subLimit(`<p class="bold align-right">150.000 € por víctima</p>`, true)}


          <h4 class="detail-title underlined">B.3 RESPONSABILIDAD CIVIL PRODUCTO</h4>
          <ol>
            ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
            ${block('Franquicia', franquiciaValue)}
            ${block('Ámbito territorial', 'Mundo excepto USA/Canada')}
            ${block('Jurisdicción aplicable', 'Todo el mundo excepto reclamaciones en USA/Canadá')}
          </ol>
          
        </div>
      </div>

      
    `)
  },
  'do-hiscox': ({ limit }) => {
    const formattedLimit = formatCurrency(limit);
    // const franquiciaValue = '300 €';

    return (/* html */`
      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered">
          <h3 class="detailGray">Detalles de cobertura específicos al módulo de cobertura</h3>
          <span>El límite agregado abajo indicado es el importe máximo aplicable para el conjunto de lo(s)
          módulo(s): A</span>
  
          <p><span class="bold">Límite agregado:</span> ${formattedLimit}</p>
          
          <h4 class="underlined">A HISCOX D&O</h4>
          <div>
            <h4 class="detail-title underlined">A.1 RESPONSABILIDAD CIVIL ADMINISTRADORES Y DIRECTIVOS</h4>
            <ol>
              ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
              ${block('Franquicia', 'Sin franquicia')}
              ${block('Ámbito territorial', 'Mundial')}
              ${block('Jurisdicción aplicable', 'Todo el mundo excepto reclamaciones en USA/Canadá')}
            </ol>

            ${subLimit([
        [
          'Gastos de defensa en prevención de riesgos laborales',
          '300.000 € por reclamación y periodo de seguro'
        ],
        [
          'Multas administrativas',
          '100.000 € por multa y periodo de seguro'
        ],
        [
          'Gastos de defensa de reclamaciones bajo secreto de sumario',
          '300.000 € por reclamación y periodo de seguro'
        ],
        [
          'Reclamaciones por contaminación medioambiental',
          '100.000 € por reclamación y periodo de seguro'
        ],
        [
          'Gastos en gestión de crisis',
          '100.000 € por reclamación y periodo de seguro'
        ],
        [
          'Gastos de persona clave',
          '100.000 € por reclamación y periodo de seguro'
        ],
      ])}
          </div>
        </div>
      </div>

      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered">
          <h4 class="detail-title underlined">A.2 RESPONSABILIDAD DE LA ENTIDAD POR PRÁCTICAS DE EMPLEO</h4>
          
          <ol>
            ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
            ${block('Franquicia', '1.500 € por reclamación')}
            ${block('Ámbito territorial', 'Mundial excepto USA/Canadá')}
            ${block('Jurisdicción aplicable', 'Todo el mundo excepto reclamaciones en USA/Canadá')}
          </ol>

          ${subLimit([['Gastos en gestión de crisis', '100.000 € por reclamación y periodo de seguro']])}

          <h4 class="detail-title underlined">A.3 RESPONSABILIDAD DE LA ENTIDAD</h4>
          <ol>
            ${block('Límite de indemnización', `${formattedLimit} por reclamación y periodo de seguro`)}
            ${block('Franquicia', '1.500 € por reclamación')}
            ${block('Ámbito territorial', 'Mundial excepto USA/Canadá')}
            ${block('Jurisdicción aplicable', 'Todo el mundo excepto reclamaciones en USA/Canadá')}
          </ol>

          ${subLimit([
        ['Gastos de defensa en prevención de riesgos laborales', '300.000 € por reclamación y periodo de seguro'],
        ['Gastos de gestión de crisis', '100.000 € por reclamación y periodo de seguro'],
        ['Gastos de defensa por contaminación medioambiental', '300.000 € por reclamación y periodo de seguro'],
      ])}
        </div>
      </div>

      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered bold small-text">
          <h3 class="detailGray">SUPLEMENTOS - Aplicables a póliza</h3>
          <p>1. Fecha de retroactividad (Hiscox Management): <span class="normal-text">Ilimitada</span></p>

          <p>2. Ámbito territorial y Conocimiento previo</p>
          <p>
            La reclamación debe ser presentada frente a la persona asegurada o la entidad por
            primera vez dentro del periodo de seguro de la póliza y ni la entidad ni la persona
            asegurada deberán haber tenido conocimiento de la misma, ni de hechos, investigación,
            inspección ni circunstancias que hubieran podido dar lugar a su interposición antes de
            la fecha de efecto de la póliza.
          </p>
          <p>
          La reclamación debe alegar o sugerir actos u omisiones cometidos por la persona
          asegurada o la entidad durante el período de cobertura, o con anterioridad al mismo,
          pero siempre con posterioridad a la fecha de retroactividad indicada, en su caso, en las
          condiciones particulares.
          </p>

        <p>3. Reclamaciones Previas</p>
        <p>La reclamación no puede derivar, ni basarse, ni ser atribuible a:</p>
        <ol class="roman">
          <li>procedimientos, reclamaciones, investigaciones o inspecciones que afecten a una
          persona asegurada o a la entidad o a una entidad externa, previos a la fecha de
          efecto ni</li>
          <li> a los mismos o esencialmente los mismos hechos alegados en dicho procedimiento, reclamación investigación o inspección anterior.</li>
        </ol>

        <p>4. Coberturas en exceso y exclusión en la Cobertura por contaminación medioambiental</p>
        <p>Las siguientes coberturas se otorgan en exceso, es decir, que se cubren por encima de
        cualquier otra cantidad (indemnización o gastos) cubierta en otro seguro que la persona
        asegurado y/o la entidad pudiera tener contratado para los mismos riesgos:
        Reclamaciones por contaminación medioambiental de la Sección I, Gastos de defensa
        en Prevención de Riesgos Laborales de la Sección I, y Gastos de defensa en prevención
        de Riesgos Laborales y homicidio empresarial de la Sección III.</p>
        <p>Respecto a la cobertura de Reclamaciones por contaminación medioambiental de la
        Sección I y de Gastos de defensa por contaminación medioambiental de la Sección III, en
        ningún caso, se dará cobertura a las reclamaciones relativas, derivadas o basadas
        directa o indirectamente en infecciones o transmisiones de virus o cualquier otro
        agente patógeno.</p>

        <p>5.Concurrencia de pólizas del Grupo Hiscox</p>
        <p>En el caso de que existan dos o más pólizas de seguro emitidas por la aseguradora o por
        cualquier otra sociedad que pertenezca al Grupo Hiscox y otorguen cobertura por una
        misma reclamación, el importe total a pagar para el conjunto de todas estas pólizas no
        excederá del mayor límite de indemnización de todas estas pólizas.</p>
        </div>
      </div>

      
    `)
  },
  'do-markel': () => (/* html */`
      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered">
          <p class="underlined markel-title markel-big">Sublímites</p>
          <p class="markel-title">Sección A: Protección para asegurados</p>
          <ul class="markel-list">
            <li>Gastos de Publicidad: 300.000 €</li>
            <li>Gastos de Gerencia de Riesgos: 300.000 €</li>
            <li>Sanciones Administrativas: 120.000 €</li>
            <li>Gastos del Aval Concursal: 150.000 €</li>
            <li>Gastos del Aval en evitación del Embargo Preventivo: 150.000 €</li>
            <li>Inhabilitación Profesional: 36.000 € (3.000 €/mes, máximo 12 meses)</li>
            <li>Gastos de Emergencia: 150.000 €</li>
            <li>Gastos de Privación de Bienes: 200.000 €</li>
            <li>Abogados internos: 300.000 €</li>
            <li>Gastos de defensa en prevención de riesgos laborales: 60.000 €</li>
            <li>Gastos de Asistencia Psicológica: 60.000 €</li>
            <li>Gastos de Defensa de Personas Vinculadas: 60.000 €</li>
            <li>Gastos de Persona Clave: 60.000 €</li>
            <li>Gastos en Materia Reguladora: 60.000 €</li>
          </ul>

          <p class="markel-title">Sección B: Protección para la entidad</p>
          <ul class="markel-list">
            <li>Gastos de Defensa en Reclamaciones por Homicidio Empresarial: 150.000 €</li>
            <li>Protección de Datos: 100.000 €</li>
            <li>Gastos de defensa por responsabilidad penal corporativa: 300.000 €</li>
            <li>Interim Management: 150.000 €</li>
            <li>Gastos legales de un Accionista Derivados de una Acción Social de Responsabilidad: 150.000 €</li>
          </ul>
          <span>(**) Para límite por siniestro y año de 150.000 €; Sub-límites máximos de 150.000 €</span>
          <br />
          <br />

          <p class="markel-title">Franquicia:</p>
          <p>Protección de Datos: 3000 €</p>

          <p><span class="markel-title">Ámbito territorial: </span> Todo el mundo excepto EE.UU./Canadá.</p>
          <p><span class="markel-title">Retroactividad: </span> Ilimitada</p>
        </div>
      </div>

      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered">
          <p class="markel-title">Información sobre Protección de Datos Clientes</p>
          <p class="tabbed">
            <b>RESPONSABLE</b>: MARKEL INSURANCE SE, Sucursal en España (W2764898I), Plaza Pablo Ruiz
  Picasso, 1, planta 35,28020 de Madrid,markel@delegado-datos.com. <b>FINALIDADES</b>: Evaluar el
  riesgo de la cobertura solicitada, tramitar el desarrollo, cumplimiento y control del seguro
  contratado, tramitar los posibles siniestros e informarle de nuestros productos y servicios vía
  electrónica y postal. <b>LEGITIMACIÓN</b>: Ejecución del contrato de seguro e interés legítimo en
  informar a nuestros clientes de nuestros productos y servicios. <b>CESIONES</b>: En los casos
  legalmente establecidos y, durante la tramitación de los siniestros, a corredores y agentes de
  seguros, compañías aseguradoras y todas las entidades, organismos o personas legitimadas y
  necesarias para la resolución y tramitación de siniestros. <b>CONSERVACIÓN</b>: Durante la vigencia
  de la relación póliza y, finalizada ésta, durante los plazos exigidos legalmente para atender
  responsabilidades. Datos comerciales: cuando el usuario solicite su baja. <b>DERECHOS</b>: Tiene
  derecho a solicitar el acceso, rectificación, supresión, oposición, limitación y portabilidad de sus
  datos dirigiéndose a los datos de contacto del responsable. En caso de divergencias, puede
  presentar una reclamación ante la Agencia de Protección de Datos (www.agpd.es). No se
  entregará documentación del cliente a terceros no autorizados.
          </p>
          <p class="tabbed extra"><span class="checkbox"></span><span class="checkbox-text">NO DESEO RECIBIR INFORMACIONES COMERCIALES</span></p>

          <p class="markel-title">Declaración</p>
          <p class="tabbed">
          Declaro/Declaramos que (a) este formulario ha sido completado tras una apropiada investigación;
(b) sus contenidos son verdaderos y exactos y (c) todos los hechos y asuntos que puedan ser
relevantes para la consideración de nuestra propuesta de seguro han sido comunicados.
Asimismo, acuerdo/acordamos que este formulario y toda la información proporcionada será
incorporada al contrato de seguro y formarán parte del mismo. 
          </p>

          <div class="markel-sign-box">
            <div class="limit tall">
              <span class="markel-title limit-title">Firma:</span>
              <div class="limit-value sign-box"></div>
            </div>
            
            <div class="limit">
              <span class="markel-title limit-title">Nombre:</span>
              <div class="limit-value sign-box"></div>
            </div>

            <div class="limit">
              <span class="markel-title limit-title">Cargo:</span>
              <div class="limit-value sign-box"></div>
            </div>

            <div class="limit">
              <span class="markel-title limit-title">Fecha:</span>
              <div class="limit-value sign-box"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered full-width">
          <p class="markel-title center">Cuadro De Coberturas. D&O Excellence Plus</p>
          ${generateTable([
      { title: 'Responsabilidad Civil de Administradores y Altos Cargos (Asegurados)' },
      { title: 'Administradores de Hecho y de Derecho', dotted: true },
      { title: 'Secretario y Vicesecretario no Consejeros', dotted: true },
      { title: 'Herederos, Cónyuges y Parejas de Hecho', dotted: true },
      { title: 'Empleados Codemandados', dotted: true },
      { title: 'Liquidadores en caso de disolución voluntaria', dotted: true },
      { title: 'El Delegado de Protección de Datos', dotted: true },
      { title: 'El Director de la Asesoría Jurídica Interna (General Counsel)', dotted: true },
      { title: 'El Director de Cumplimiento (Compliance Officer)', dotted: true },
      { title: 'El Director de Control Financiero (Financial Controller)', dotted: true },
      { title: 'La Entidad, a los efectos de las coberturas de la sección B', dotted: true },
    ])}
          <p class="markel-title center">Sección A: Protección Para Los Asegurados</p>
          ${generateTable([
      { title: 'Reembolso a la Entidad' },
      { title: 'Gastos de Defensa' },
      { title: 'Gastos de representación Legal' },
      { title: 'Gastos de Extradición' },
      { title: 'Gastos de Publicidad', value: '300.000,00 €' },
      { title: 'Gastos de Gerencia de Riesgos', value: '300.000,00 €' },
      { title: 'Fianzas Civiles' },
      { title: 'Gastos de Constitución de Fianzas Penales' },
      { title: 'Reclamaciones por Prácticas Laborales' },
      { title: 'Nuevas Sociedades Filiales' },
      { title: 'R.C. de Administradores y Altos Cargos de Filiales' },
      { title: 'R.C. de Administradores y Altos Cargos en Participadas' },
      { title: 'Antiguos Administradores o Altos Cargos', value: '72 meses' },
      { title: 'Sanciones Administrativas', value: '120.000,00 €' },
      { title: 'Responsabilidad Concursal' },
      { title: 'Gastos de Constitución del Aval Concursal', value: '150.000,00 €' },
      { title: 'Responsabilidad Tributaria Subsidiaria' },
      { title: 'Gastos de Inspección en Materia de Defensa de la Competencia', value: '300.000,00 €' },
      { title: 'Gastos de Constitución del Aval en Evitación del Embargo Preventivo', value: '150.000,00 €' },
      { title: 'Inhabilitación Profesional', value: '3.000 €/mes, máx 12m' },
      { title: 'Responsabilidad Subsidiaria en Materia de Seguridad Social' },
      { title: 'Gastos de Emergencia', value: '150.000,00 €' },
      { title: 'Responsabilidad como Fundador' },
      { title: 'Gastos de Privación de Bienes', value: '200.000,00 €' },
      { title: 'Contaminación:', parts: ['Gastos de Defensa', 'Perjuicios a la Compañía o a sus accionistas'] },
      { title: 'Abogados Internos', value: '300.000,00 €' },
      { title: 'Gastos de Asistencia Psicológica', value: '60.000,00 €' },
      { title: 'Gastos de Defensa en Materia de Prevención de Riesgos Laborales', value: '60.000,00 €' },
      { title: 'Gastos de Defensa de Personas Vinculadas', value: '60.000,00 €' },
      { title: 'Management Buy Out' },
      { title: 'Persona Clave', value: '60.000,00 €' },
      { title: 'Gastos en Materia Reguladora', value: '60.000,00 €' },
      { title: 'Responsabilidad de Miembros de Comisiones de Control de Planes de Pensiones del Sistema de Empleo' },
    ])}
        </div>
      </div>

      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered full-width">
          <p class="markel-title center">Sección B: Protección Para La Entidad</p>
          ${generateTable([
      { title: 'Gastos de Defensa de la Entidad Codemandada' },
      { title: 'Reclamaciones por Operaciones de Valores con cobertura a la Entidad' },
      { title: 'Reclamaciones por Prácticas Laborales con Cobertura a la Entidad' },
      { title: 'Gastos de Defensa en Reclamaciones por Homicidio Empresarial (Corporate Manslaughter)', value: '150.000,00 €' },
      { title: 'Cobertura a la Entidad en su condición de Administrador (Entity Down)' },
      { title: 'Gastos de Defensa por Responsabilidad Penal Corporativa', value: '300.000,00 €' },
      { title: 'Interim Management', value: '150.000,00 €' },
      { title: 'Gastos legales de un Accionista Derivados de una Acción Social de Responsabilidad', value: '150.000,00 €' },
      { title: 'Protección de Datos (Franquicia: 3.000,00 €)', value: '150.000,00 €' },
    ])}

      <br />
      <br />
          <table>
            <tr>
              <td>
                <p>Periodo de Descubrimiento:</p>
                <p style="position:relative;padding-left: 1.5em;margin-left: 2em;"><span class="dot"></span>12 Meses sin sobreprima</p>
                <p style="position:relative;padding-left: 1.5em;margin-left: 2em;"><span class="dot"></span>24 Meses 75% de la Prima Anual</p>
                <p style="position:relative;padding-left: 1.5em;margin-left: 2em;"><span class="dot"></span>36 Meses 125% de la Prima Anual</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>Ampliación de la definición de Reclamación en Materia Concursal:</p>
                <p style="position:relative;padding-left: 1.5em;margin-left: 2em;"><span class="dot"></span>Responsabilidad Concursal: informe de la administración concursal</p>
                <p style="position:relative;padding-left: 1.5em;margin-left: 2em;"><span class="dot"></span>Gastos del Aval Concursal: embargo de bienes de administradores</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>Ampliación de la definición de hecho relevante en materia concursal:</p>
                <p style="position:relative;padding-left: 1.5em;margin-left: 2em;"><span class="dot"></span>Responsabilidad Concursal: embargo preventivo de administradores, y resolución judicial ordenando la apertura de la sección de calificación</p>
                <p style="position:relative;padding-left: 1.5em;margin-left: 2em;"><span class="dot"></span>Gastos del Aval Concursal: solicitud de concurso necesario reclamando el embargo preventivo de los administradores</p>
              </td>
            </tr>
            <tr>
              <td>
                <p>Cambio de control en material concursal:</p>
                <p style="position:relative;padding-left: 1.5em;margin-left: 2em;"><span class="dot"></span>Sólo si el Tomador pasa a estar en situación de liquidación o, en caso de concurso, si se abre la fase de liquidación</p>
              </td>
            </tr>
            </tr>
          </table>

          <br />
          <p>Este documento tiene un propósito meramente informativo. El alcance de las coberturas que ofrece este seguro está recogido en el Condicionado de Markel “D&O Excellence Plus”.</p>
        </div>
      </div>
    `),
  'rcp-markel-top': () => (/* html */`
          <p class="markel-title">Franquicias:</p>
          <p class="tabbed">
            <span>General: 300 € por Reclamación<span>
            <br />
            <span>Específica para la cobertura de Protección de Datos: 3.000 € por Reclamación</span>
          </p>
          <br />
          <p class="markel-title markel-medium">Resumen de coberturas</p>
          <p><span class="markel-title">Condicionado:</span> MARKEL MISCELLANEOUS 2019</p>
          <p><span class="markel-title">Ámbito Territorial y Jurisdiccional:</span> UNIÓN EUROPEA</p>
          <p><span class="markel-title">Fecha Retroactiva:</span> <span class="bold">1 AÑO ANTERIOR A LA FECHA DE EFECTO</span></p>
          
          <p class="markel-title">Sublímites:</p>
          <div class="tabbed">
            <p class="bold">- RC General: Según el límite elegido con un máximo de 600.000 € (este límite no podrá ser superior al límite contratado)</p>
            <p class="bold">
              <span>- RC Patronal: Según el límite elegido con un máximo de 600.000 € (este límite no podrá ser superior al límite contratado)</span>
              <br />
              <p class="bold" style="margin-left:20px;margin-top:-10px">Opciones con un sublímite por víctima de 150.000 € o 300.000 € (dependiendo del Límite contratado) sin coste</p>
              <br />
              <p class="bold" style="margin-left:20px;margin-top:-25px">Opción de incremento del Sublímite por víctima a 450.000 €: 70 € netos adicionales</p>
            </p>
          </div>

          <p>
          - RC Locativa: <span class="bold">150.000 €</span> por reclamación y anualidad del seguro <br />
          - Inclusión RC Cruzada (mismo sublímite por víctima que RC Patronal) <br />
          - Inclusión RC Subsidiaria de subcontratistas, de acuerdo con el límite de RC General. <br />
          - Gastos de defensa en materia de propiedad intelectual y/o industrial: 150.000 € por reclamación y anualidad <br />
          - Inhabilitación profesional: 30.000 € (máx. 2.500 €/mes por un periodo máx. de 12 meses) <br />
          - Deshonestidad de empleados: 150.000 € por reclamación y anualidad de seguro <br />
          - Pérdida de documentos: 150.000 € por reclamación y anualidad de seguro <br />
          - Protección de datos: 60.000 € por reclamación y anualidad de seguro <br />
          </p>

          <p class="bold">La cobertura de seguro sólo comenzará tras la confirmación por parte de Markel, previo análisis satisfactorio de este Cuestionario.</p>
          <p class="bold">A su vencimiento, el seguro quedará sujeto al régimen de prórroga tácita establecido en el artículo 22 de la Ley de Contrato de Seguro.</p>

        </div>
      </div>


      <div class="page details">
    <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
      <div class="centered">
        <p class="markel-title">Coberturas opcionales:</p>
        <div>
          <p class="bold">a) Retroactividad limitada:</p>
          <div style="font-size:11px">
            <p style="position:absolute">
              <span>¿Desean una <span class="bold">retroactividad ilimitada</span>?</span>
              ${boolBox(true)}
            </p>
            <br />
            En caso afirmativo, rogamos nos indiquen si existe póliza anterior y no ha habido algún cambio significativo de la información respecto a dicha póliza. 
            En el caso de que si exista póliza anterior se recargará las primas de arriba en un 15% para aplicar la retroactividad ilimitada, en el caso de que no exista la retroactividad se mantendrá en 1 año.
            <hr />
          </div>

          <p class="bold">b) Periodo de descubrimiento:</p>
          <div>
          Si la póliza NO se renueva por el Asegurador: 12 meses con prima adicional de un 20% de la última
          prima neta
          <hr />
          <p class="bold">Quedan excluidas de esta oferta las actividades de Abogacía, Asesoría fiscal, laboral, contable, tasación hipotecaria o crediticia, 
                          asesoría financiera, la actividad de delegado de protección de datos, la auditoría de cuentas, gestor administrativo y la gestión y tramitación de subvenciones.</p>
          <p class="bold">La cobertura de seguro sólo comenzará tras la confirmación por parte de Markel, previo análisis satisfactorio de este Cuestionario.</p>
          <p class="bold">A su vencimiento, el seguro quedará sujeto al régimen de prórroga tácita establecido en el artículo 22 de la Ley de Contrato de Seguro.</p>
          </div>
        </div>
      </div>
    </div>


      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered">
          <p class="markel-title">Protección de Datos de Carácter Personal</p>
          <p class="tabbed">
            <b>RESPONSABLE</b>: MARKEL INSURANCE SE, Sucursal en España (W2764898I), Plaza Pablo Ruiz
  Picasso, 1, planta 35,28020 de Madrid,markel@delegado-datos.com. <b>FINALIDADES</b>: Evaluar el
  riesgo de la cobertura solicitada, tramitar el desarrollo, cumplimiento y control del seguro
  contratado, tramitar los posibles siniestros e informarle de nuestros productos y servicios vía
  electrónica y postal. <b>LEGITIMACIÓN</b>: Ejecución del contrato de seguro e interés legítimo en
  informar a nuestros clientes de nuestros productos y servicios. <b>CESIONES</b>: En los casos
  legalmente establecidos y, durante la tramitación de los siniestros, a corredores y agentes de
  seguros, compañías aseguradoras y todas las entidades, organismos o personas legitimadas y
  necesarias para la resolución y tramitación de siniestros. <b>CONSERVACIÓN</b>: Durante la vigencia
  de la relación póliza y, finalizada ésta, durante los plazos exigidos legalmente para atender
  responsabilidades. Datos comerciales: cuando el usuario solicite su baja. <b>DERECHOS</b>: Tiene
  derecho a solicitar el acceso, rectificación, supresión, oposición, limitación y portabilidad de sus
  datos dirigiéndose a los datos de contacto del responsable. En caso de divergencias, puede
  presentar una reclamación ante la Agencia de Protección de Datos (www.agpd.es). No se
  entregará documentación del cliente a terceros no autorizados.
          </p>
          <p class="tabbed extra" style="position:relative"><span class="checkbox"></span><span class="checkbox-text">NO DESEO RECIBIR INFORMACIONES COMERCIALES</span></p>

          <p class="markel-title">Declaración</p>
          <p class="tabbed">
          Declaro/Declaramos que (a) este formulario ha sido completado tras una apropiada investigación;
(b) sus contenidos son verdaderos y exactos y (c) todos los hechos y asuntos que puedan ser
relevantes para la consideración de nuestra propuesta de seguro han sido comunicados.
Asimismo, acuerdo/acordamos que este formulario y toda la información proporcionada será
incorporada al contrato de seguro y formarán parte del mismo. 
          </p>


          <div class="horizontal" style="margin-top:10px">
            <p>
              <span class="bold">Firma, nombre y cargo</span>: <span class="void big" style="width:200px"></span>
              <span class="bold">Fecha</span>: 
              <span class="void small"></span>/<span class="void small"></span>/<span class="void small"></span>
            </p>
          </div>
  `),
  'rcp-markel-it': () => (/* html */`
          <p class="markel-title">Franquicias:</p>
          <p class="tabbed" style="margin-top: -8px">
            <span>General: 400 € por Reclamación<span>
            <br />
            <span>Específica para la actividad de hosting y /o housing: 2.000 € por Reclamación</span>
            <br />
            <span>Específica para la cobertura de Protección de Datos: 3.000 € por Reclamación</span>
          </p>
          <p><span class="markel-title">Condicionado aplicable:</span> MARKEL PI EMPRESAS IT 2019</p>
          <p><span class="markel-title">Ámbito Territorial y Jurisdiccional:</span> Unión Europea</p>
          <p><span class="markel-title">Fecha Retroactiva:</span> <span class="bold">1 año anterior al efecto de la póliza</span></p>
          
          <p class="markel-title">Coberturas:</p>
          <div class="tabbed">
            <p class="bold">- RC General: Según el límite elegido con un máximo de 600.000.-€ (este límite no podrá ser superior al límite contratado)</p>
            <p class="bold" style="margin-top:-10px">
              <span>- RC Patronal: Según el límite elegido con un máximo de 600.000.-€ (este límite no podrá ser superior al límite contratado)</span>
              <ul style="list-style-type:circle; margin-top: -8px">
                <li class="bold">Opción 1: 150.000 € (por víctima) sin coste</li>
                <li class="bold">Opción 2: 300.000 € (por víctima) sin coste</li>
                <li class="bold">Opción 3: 450.000 €: 70 €</li>
              </ul>
            </p>
          </div>

          <p class="tabbed">
          - Inclusión RC Cruzada (mismo sublímite por víctima que RC Patronal) <br />
          - RC Locativa: <span class="bold">150.000 €</span> por reclamación y anualidad del seguro <br />
          - RC Subsidiaria de Contratistas y Subcontratistas (RC General) <br />
          - RC Productos<br />
          - RC Producto Tecnológico<br />
          - Gastos de Restitución de imagen y reputación: 150.000 € por reclamación y anualidad de seguro<br />
          - Perdida de Registros Informáticos <br />
          - Gastos de defensa Propiedad Intelectual y/o Industrial: 150.000 € por reclamación y anualidad <br />
          - Inhabilitación profesional: 30.000 € (máx. 2.500 €/mes por un periodo máx. de 12 meses) <br />
          - Deshonestidad de Empleados: 150.000 € por reclamación y anualidad de seguro <br />
          - Pérdida de Documentos: 150.000 € por reclamación y anualidad de seguro <br />
          - Protección de Datos: 60.000 € por reclamación y anualidad de seguro <br />
          </p>

        </div>
      </div>

      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered">
          <p class="markel-title">Coberturas opcionales:</p>
          <div>
            <p class="bold">a) Retroactividad limitada:</p>
            <div style="font-size:11px">
              <p style="position:absolute">
                <span>¿Desean una <span class="bold">retroactividad ilimitada</span>?</span>
                ${boolBox(true)}
              </p>
              <br />
              En caso afirmativo, rogamos nos indiquen si existe póliza anterior y no ha habido algún cambio significativo de la información respecto a dicha póliza.
              <br />
              ${boolBox(false)}
              <br />

              En el caso de que si exista póliza anterior se recargará las primas de arriba en un 15% para aplicar la retroactividad ilimitada, en el caso de que no exista la retroactividad se mantendrá en 1 año.
              <hr />
            </div>

            <p class="bold">b) Periodo de descubrimiento:</p>
            <div>
            Si la póliza NO se renueva por el Asegurador: 12 meses con prima adicional de un 20% de la última
            prima neta
            <hr />
            <p class="bold">La cobertura de seguro sólo comenzará tras la confirmación por parte de Markel, previo análisis satisfactorio de este Cuestionario.</p>
          <p class="bold">A su vencimiento, el seguro quedará sujeto al régimen de prórroga tácita establecido en el artículo 22 de la Ley de Contrato de Seguro.</p>
            </div>
          </div>
        </div>
      </div>


      <div class="page details">
      <div class="header">
    <span class="circuloAmarillo"></span> 
    <span class="rectanguloAmarillo"></span>
    <p><b>YOUR CHIEF INSURANCE OFFICER</b></p>
  </div>
      <img src="${LOGO_URL}" class="logo" />
        <div class="centered">
          <p class="markel-title">Información sobre Protección de Datos Clientes</p>
          <p class="tabbed">
            <b>RESPONSABLE</b>: MARKEL INSURANCE SE, Sucursal en España (W2764898I), Plaza Pablo Ruiz
  Picasso, 1, planta 35,28020 de Madrid,markel@delegado-datos.com. <b>FINALIDADES</b>: Evaluar el
  riesgo de la cobertura solicitada, tramitar el desarrollo, cumplimiento y control del seguro
  contratado, tramitar los posibles siniestros e informarle de nuestros productos y servicios vía
  electrónica y postal. <b>LEGITIMACIÓN</b>: Ejecución del contrato de seguro e interés legítimo en
  informar a nuestros clientes de nuestros productos y servicios. <b>CESIONES</b>: En los casos
  legalmente establecidos y, durante la tramitación de los siniestros, a corredores y agentes de
  seguros, compañías aseguradoras y todas las entidades, organismos o personas legitimadas y
  necesarias para la resolución y tramitación de siniestros. <b>CONSERVACIÓN</b>: Durante la vigencia
  de la relación póliza y, finalizada ésta, durante los plazos exigidos legalmente para atender
  responsabilidades. Datos comerciales: cuando el usuario solicite su baja. <b>DERECHOS</b>: Tiene
  derecho a solicitar el acceso, rectificación, supresión, oposición, limitación y portabilidad de sus
  datos dirigiéndose a los datos de contacto del responsable. En caso de divergencias, puede
  presentar una reclamación ante la Agencia de Protección de Datos (www.agpd.es). No se
  entregará documentación del cliente a terceros no autorizados.
          </p>
          <p class="tabbed extra" style="position:relative"><span class="checkbox"></span><span class="checkbox-text">NO DESEO RECIBIR INFORMACIONES COMERCIALES</span></p>

          <p class="markel-title">Declaración</p>
          <p class="tabbed">
          Declaro/Declaramos que (a) este formulario ha sido completado tras una apropiada investigación;
(b) sus contenidos son verdaderos y exactos y (c) todos los hechos y asuntos que puedan ser
relevantes para la consideración de nuestra propuesta de seguro han sido comunicados.
Asimismo, acuerdo/acordamos que este formulario y toda la información proporcionada será
incorporada al contrato de seguro y formarán parte del mismo. 
          </p>


          <div class="horizontal" style="margin-top:10px">
            <p>
              <span class="bold">Firma, nombre y cargo</span>: <span class="void big" style="width:200px"></span>
              <span class="bold">Fecha</span>: 
              <span class="void small"></span>/<span class="void small"></span>/<span class="void small"></span>
            </p>
          </div>
  `)
}
