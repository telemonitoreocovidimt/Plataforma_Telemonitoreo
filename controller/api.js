const {validateTerm} = require('./../model/user');

/**
 * Api para validar si un usuario acepto los terminos
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function apiAcceptedTermsByUser(req, res) {
  const dni = req.params.dni;
  const data = await validateTerm(dni);
  const result = data.result;
  const userExists = result.length == 0? false: true;
  let acceptedTerms = false;
  if (userExists) {
    acceptedTerms = result[0].acepto_terminos;
  }
  return res.json({
    'success': true,
    'accepted_terms': acceptedTerms,
  });
}

module.exports = {
  apiAcceptedTermsByUser,
};
