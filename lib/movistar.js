const request = require('request');
const {BASE64_CREDENTIALS_MOVISTAR} = require('./../config');
/**
 * Enviar mensaje de SMS
 * @param {String} phone Número de celular.
 * @param {String} message Contenido del SMS.
 */
function sendSMS(phone, message) {
  request({
    'method': 'GET',
    'url': 'https://apitellit.aldeamo.com/SmsiWS/smsSendGet',
    'qs': {
      'mobile': phone,
      'country': '51',
      'encoding': 'utf-8',
      'message': message,
      'messageFormat': 1,
    },
    'headers': {
      'Authorization': `Basic ${BASE64_CREDENTIALS_MOVISTAR}`,
    },
  }, (err, res, data)=>{
    if (err) {
      console.error(err);
    }
  });
}

/**
 * @typedef {Object} ListRecipent
 * @property {String} mobile Número de celular.
 * @property {number} correlationLabel Identificación grupo.
 * @property {String} url URL que se enviara agregado al sms.
 */

/**
 * Enviar mensajes masivos.
 * @param {Array.<ListRecipent>} listRecipent Lista de receptores.
 * @param {String} message Texto que se enviara a todos los celulares.
 */
function sendManySMS(listRecipent, message) {
  const data = {
    'country': '51',
    'message': message,
    'messageFormat': 1,
    'encoding': 'utf-8',
    'addresseeList': listRecipent,
  };
  const options = {
    'method': 'POST',
    'url': 'https://apitellit.aldeamo.com/SmsiWS/smsSendPost/',
    'json': true,
    'headers': {
      'authorization': `Basic ${BASE64_CREDENTIALS_MOVISTAR}`,
    },
    'body': data,
  };
  request(options, function(err, res, data) {
    if (err) {
      console.error(err);
    }
    console.log(data);
  });
};

module.exports = {
  sendSMS,
  sendManySMS,
};
