
/**
 * Validar parametros JSON para identificar
 * el tipo de documento y número de documento.
 * Para eso se trata de ubicar los parametros dni y ce.
 * De encontrarlos se agregara al Body del request los campos:
 * typeDocument => 1 (dni) O 2 (ce)
 * numberDocument => Número del documento
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 */
function sanitizeIdentificationDocument(req, res, next) {
  const {dni, ce} = req.body;
  if (dni != '' && dni != null) {
    req.body.typeDocument = 1;
    req.body.numberDocument = dni;
  } else {
    req.body.typeDocument = 2;
    req.body.numberDocument = ce;
  }
  next();
};

module.exports = {
  sanitizeIdentificationDocument,
};
