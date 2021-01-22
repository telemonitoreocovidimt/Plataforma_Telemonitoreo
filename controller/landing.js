/* eslint "max-len" : ["error", {"code":100}] */
const {validateTerm, updateTermsPatient} = require('./../model/user');
const {getMasterParameterHospital} = require('./../model/masterParameters');
const {setName, setTypeDocument} = require('./../model/pacient');
const {getTimeNow} = require('./../lib/time');
/**
 * Mostrar la vista de terminos y condiciones.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function terms(req, res) {
  const {peruvianDateInit} = getTimeNow();
  const numberDocument = req.params.dni;
  const userTemp = req.session.userTemp;
  const namePatient = userTemp.nombre;
  const typeDocument = userTemp.tipo_documento;
  const toDay = peruvianDateInit.substring(0, 10);
  const data = await validateTerm(numberDocument);
  const result = data.result;
  const userExists = result.length == 0? false: true;
  let acceptedTerms = false;
  if (userExists) {
    acceptedTerms = result[0].acepto_terminos;
  }
  let contactDescription = await getMasterParameterHospital(1, userTemp.id_hospital);
  if (contactDescription.result.length == 0) {
    contactDescription = '';
  } else {
    contactDescription = contactDescription.result[0].descripcion;
  }
  await req.useFlash(res);
  return res.render('terms', {
    'layout': 'blank',
    'title': 'terms and conditions',
    namePatient,
    contactDescription,
    numberDocument,
    acceptedTerms,
    userExists,
    toDay,
    typeDocument,
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
 * Mostrar la vista de agradecimiento para los terminos y condiciones.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function rejectedThanksTerms(req, res) {
  const userTemp = req.session.userTemp;
  if (userTemp) {
    return res.render('refuseTerms', {
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
    await setName(body.name, userTemp.dni);
    await setTypeDocument(body.typeDocument, userTemp.dni);
    const acceptedTerm = body.acceptTerm ? 2 : 1;
    if (acceptedTerm == 2) {
      await updateTermsPatient(userTemp.dni, acceptedTerm);
      return res.redirect(`/landing/terms/${userTemp.dni}/thanks`);
    } else if (acceptedTerm == 1) {
      return res.redirect(`/landing/terms/${userTemp.dni}/rejected/thanks`);
    } else {
      return res.redirect(`/landing/terms/${userTemp.dni}`);
    }
  } else {
    return res.redirect('back');
  }
};

module.exports = {
  terms,
  thanksTerms,
  updateTerms,
  rejectedThanksTerms,
};
