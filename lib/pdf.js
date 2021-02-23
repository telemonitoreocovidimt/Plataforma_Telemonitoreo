/* eslint max-len: ['error', {code:200}] */
// const pdf = require('html-pdf-node');
// const pdf = require('html-pdf');
// const options = {'format': 'A4'};
const conversion = require('phantom-html-to-pdf')();
const path = require('path');
const hbs = require('express-handlebars').create({
  'partialsDir': path.join(path.join(__dirname, 'views'), 'partials'),
});

/**
 * Generar pdf de los terminos y condiciones.
 * @param {String} detailHospital Detalles de hospital.
 * @param {String} name Nombre del paciente.
 * @param {String} typeDocument Tipo de documento del paciente.
 * @param {String} numberDocument Dni del paciente.
 * @param {String} today Fecha del caso.
 * @param {Boolean} acceptTermData Acepto los terminos de uso de datos.
 * @param {Boolean} acceptTerm acepto los terminos de monitoreo.
 * @return {Promise} Retorna el buffer del pdf.
 */
function generatePDFTerms(detailHospital, name, typeDocument, numberDocument, today, acceptTermData, acceptTerm) {
  return new Promise(async (resolve, reject) => {
    const html = await hbs.render(path.join(path.join(__dirname, 'templates'), 'emailTerms.hbs'),
        {detailHospital, name, typeDocument, numberDocument, today, acceptTermData, acceptTerm});
    // pdf.create(html, options).toBuffer(function(err, buffer) {
    //   if (err) {
    //     return reject(err);
    //   } else {
    //     return resolve(buffer);
    //   }
    // });
    // pdf.generatePdf({'content': html}, options).then((buffer) => {
    //   console.log('PDF Buffer:-', buffer);
    //   return resolve(buffer);
    // });
    conversion({'html': html}, function(err, pdf) {
      if (err) {
        return reject(err);
      } else {
        const buffer = [];
        pdf.stream.on('data', function(data) {
          buffer.push(data);
        });
        pdf.stream.on('end', function() {
          const bufferPDF = Buffer.concat(buffer);
          return resolve(bufferPDF);
        });
      }
      //   var output = fs.createWriteStream('/path/to/output.pdf')
      //   console.log(pdf.logs);
      //   console.log(pdf.numberOfPages);
      // since pdf.stream is a node.js stream you can use it
      // to save the pdf to a file (like in this example) or to
      // respond an http request.
      //   pdf.stream.pipe(output);
    });
  });
}

module.exports = {generatePDFTerms};
