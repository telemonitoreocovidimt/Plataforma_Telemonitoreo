const {getInfoPatient} = require('./../model/user');

/**
 * Validar si es un usuario administrador
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
function isAdmin(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  }
  return res.redirect('/');
}

/**
 * Validar si es un doctor o voluntario
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
function isDoctor(req, res, next) {
  if (req.session.user) {
    if (!req.session.isAdmin) {
      return next();
    }
  }
  return res.redirect('/');
}

/**
 * Validar si es un doctor o voluntario
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
async function isUserParam(req, res, next) {
  const dni = req.params.dni;
  const result = await getInfoPatient(dni);
  if (result.result.length) {
    req.session.userTemp = result.result[0];
  }
  return req.session.save(()=>{
    next();
  });
}

module.exports = {
  isAdmin,
  isDoctor,
  isUserParam,
};
