const {validateTerm, updateTermsPatient} = require('./../model/user');
/**
 * Mostrar la vista de terminos y condiciones.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function terms(req, res) {
  const dni = req.params.dni;
  const data = await validateTerm(dni);
  const result = data.result;
  const userExists = result.length == 0? false: true;
  let acceptedTerms = false;
  if (userExists) {
    acceptedTerms = result[0].acepto_terminos;
  }
  await req.useFlash(res);
  return res.render('terms', {
    'layout': 'blank',
    'title': 'terms and conditions',
    acceptedTerms,
    userExists,
  });
}

/**
 * Mostrar la vista de agradecimiento para los terminos y condiciones.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function thanksTerms(req, res) {
  const userTemp = req.session.userTemp;
  if (userTemp) {
    return res.render('successTerms', {
      'layout': 'blank',
      'title': 'terms and conditions',
      ...userTemp,
    });
  } else {
    return res.redirect(`/landing/terms/${userTemp.dni}`);
  }
}

/**
 * Mostrar la vista de terminos y condiciones.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function updateTerms(req, res) {
  const userTemp = req.session.userTemp;
  const body = req.body;
  if (userTemp) {
    const acceptedTerm = body.acceptTerm ? true : false;
    if (acceptedTerm) {
      await updateTermsPatient(userTemp.dni, acceptedTerm);
      return res.redirect(`/landing/terms/${userTemp.dni}/thanks`);
    }
    return res.redirect(`/landing/terms/${userTemp.dni}`);
  } else {
    return res.redirect('back');
  }
};

module.exports = {
  terms,
  thanksTerms,
  updateTerms,
};
