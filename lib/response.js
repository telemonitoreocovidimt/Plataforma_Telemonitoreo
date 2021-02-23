const enums = require('./../res/enum');
/**
 * Crear una respuesta BAD REQUEST.
 * @param {Object} res Objeto response
 * @param {String} title Mensaje con mas prioridad a enviar.
 * @param {String} message Mensaje que se enviara.
 * @return {Object} Respuesta BAD REQUEST.
 */
function badRequest(res, title='', message='') {
  if (res.locals.typeResponse == enums.TYPE_RESPONSE.JSON) {
    return res.status(400).json({
      'error': title,
      'message': message,
      'success': false,
    });
  }
  return res.render('thanks', {
    'layout': 'blankLanding',
    'title': title,
    'message': message,
  });
}

/**
 * Crear una respuesta OK REQUEST.
 * @param {Object} res Objeto response
 * @param {String} title Mensaje con mas prioridad a enviar.
 * @param {String} message Mensaje que se enviara.
 * @return {Object} Respuesta OK REQUEST.
 */
function okRequest(res, title='', message='') {
  if (res.locals.typeResponse == enums.TYPE_RESPONSE.JSON) {
    return res.status(200).json({
      'error': title,
      'message': message,
      'success': true,
    });
  }
  return res.render('thanks', {
    'layout': 'blankLanding',
    'title': title,
    'message': message,
  });
}

module.exports = {
  badRequest,
  okRequest,
};
