/* eslint "max-len" : ["error", {"code":100}] */
const {validateTerm, updateTermsPatient} = require('./../model/user');
const {setName, setTypeDocument} = require('./../model/pacient');
const time = require('./../lib/time');
const enums = require('./../res/enum');

/**
 * Mostrar la vista de terminos y condiciones.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function terms(req, res) {
  const patient = req.session.patient;
  if (patient == null) {
    response.badRequest(res, MESSAGES.ERROR.PATIENT_COVID_NO_EXIST);
    return;
  }
  const masterParameterHospital = req.session.masterParameterHospital;
  if (masterParameterHospital == null) {
    response.badRequest(res, MESSAGES.ERROR.GROUP_PARAMETERS_HOSPITAL_NO_EXIST);
    return;
  }
  const {
    dni: numberDocument,
    nombre: namePatient,
    tipo_documento: typeDocument,
    acepto_terminos: acceptedTerms,
  } = patient;
  const {
    descripcion: contactDescription,
  } = masterParameterHospital;
  const peruvianDateInit = time.getTimeNow().peruvianDateInit;
  const currentDay = peruvianDateInit.substring(0, 10);
  if (enums.STATUS_TERMS.NO_RESPONSE == acceptedTerms) {
    res.render('terms', {
      'layout': 'blank',
      'title': 'Terminos y condiciones',
      ...patient,
      namePatient,
      contactDescription,
      numberDocument,
      acceptedTerms,
      currentDay,
      typeDocument,
    });
  } else {
    res.redirect(`/landing/terms/${numberDocument}/thanks`);
  }
}

/**
 * Mostrar la vista de agradecimiento para los terminos y condiciones.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function thanksTerms(req, res) {
  const patient = req.session.patient;
  if (patient == null) {
    response.badRequest(res, MESSAGES.ERROR.PATIENT_COVID_NO_EXIST);
    return;
  }
  const {
    dni: numberDocument,
    nombre: namePatient,
    acepto_terminos: acceptedTerms,
  } = patient;
  if (acceptedTerms == enums.STATUS_TERMS.REFUSED) {
    return res.render('refuseTerms', {
      'layout': 'blank',
      'title': 'terms and conditions',
      numberDocument,
      namePatient,
    });
  } else if (acceptedTerms == enums.STATUS_TERMS.ACCEPTED) {
    return res.render('successTerms', {
      'layout': 'blank',
      'title': 'terms and conditions',
      numberDocument,
      namePatient,
    });
  } else {
    return res.redirect(`/landing/terms/${numberDocument}`);
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
  const patient = req.session.patient;
  if (patient == null) {
    response.badRequest(res, MESSAGES.ERROR.PATIENT_COVID_NO_EXIST);
    return;
  }
  const {
    dni: numberDocument,
  } = patient;
  const body = req.body;
  await setName(body.name, numberDocument);
  await setTypeDocument(body.typeDocument, numberDocument);
  const acceptedTerm = body.acceptTerm == 'on'? 2 : 1;
  const acceptedTermData = body.acceptTermsData == 'on' ? 2 : 1;
  await updateTermsPatient(numberDocument, acceptedTerm, acceptedTermData);
  if (acceptedTerm == enums.STATUS_TERMS.NO_RESPONSE) {
    return res.redirect('back');
  } else {
    return res.redirect(`/landing/terms/${numberDocument}/thanks`);
  }
};

module.exports = {
  terms,
  thanksTerms,
  updateTerms,
  // rejectedThanksTerms,
  // vaccinePatientRegistry,
  // validationVaccinePatients,
  // vaccinePatientSurvey,
  // ThanksVaccinePatients,
};
