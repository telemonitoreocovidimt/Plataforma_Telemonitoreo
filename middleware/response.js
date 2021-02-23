const enums = require('./../res/enum');

/**
 * Configurar flag para que la respuesta sea en HTML.
 * @param {Object} req Objeto request.
 * @param {Object} res Objeto response.
 * @param {Function} next Función para seguir la solicitud.
 */
function responseRender(req, res, next) {
  res.locals.typeResponse = enums.TYPE_RESPONSE.RENDER;
  next();
}

/**
 * Configurar flag para que la respuesta sea JSON.
 * @param {Object} req Objeto request.
 * @param {Object} res Objeto response.
 * @param {Function} next Función para seguir la solicitud.
 */
function responseJson(req, res, next) {
  res.locals.typeResponse = enums.TYPE_RESPONSE.JSON;
  next();
}

module.exports = {
  responseRender,
  responseJson,
};
