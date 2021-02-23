/* eslint max-len : ["error", {"code": 100}] */
const enums = require('./../res/enum');
const response = require('./../lib/response');

/**
 * Registro de pacientes con vacuna.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 */
function registrationOfPatientsWithVaccine(req, res) {
  if (req.session.tempPatientWithVaccineRegister) {
    delete req.session.tempPatientWithVaccineRegister;
  }
  req.session.save(()=>{
    return res.render('vaccinePatientRegistry', {
      'layout': 'blankLanding',
      'title': 'Registro de pacientes con vacuna',
    });
  });
};

/**
 * Vista para validar celualr de pacientes con vacunas.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
function validatePhoneOfPatientsWithVaccine(req, res) {
  if (!req.session.tempPatientWithVaccineRegister) {
    return res.redirect('/vacuna');
  }
  const tempPatientWithVaccineRegister = req.session.tempPatientWithVaccineRegister;
  return res.render('validationVaccinePatients', {
    'layout': 'blankLanding',
    'title': 'Validar número de celular de pacientes con vacuna',
    'phoneHint': '••• ••• ' + tempPatientWithVaccineRegister.phone.substring(6, 9),
  });
};

/**
 * Agradecimiento de pacientes con vacunas.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function thanksRegistrationOfPatientsWithVaccine(req, res) {
  if (!req.session.tempPatientWithVaccineRegister) {
    return res.redirect('/vacuna');
  }
  const {
    nombre: name,
  } = req.session. tempPatientWithVaccineRegister;
  delete req.session.tempPatientWithVaccineRegister;
  req.session.save(()=>{
    return res.render('thanks', {
      'layout': 'blankLanding',
      'title': '¡Registro completado!',
      'message': `Hola ${name}, se valido correctamente su número de celular.
        En los siguientes dias recibira mensajes de texto con un
        LINK para que pueda realizar su seguimiento.`,
    });
  });
};


/**
 * Encuesta diaria de pacientes con vacunas.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
function dailySurveyFormOfPatientsWithVaccine(req, res) {
  const patientVaccine = req.session.patientVaccine;
  const caseForm = req.session.caseForm;
  const {
    estado_caso: statusCaseForm,
  } = caseForm;
  if (statusCaseForm == enums.STATUS_CASE_FORM.CLOSED) {
    response.okRequest(res, 'Encuenta realizada',
        `Usted ya respondio la encuesta diaria programada para hoy, intentelo mañana.`);
    return;
  }
  return res.render('vaccinePatientSurvey', {
    'layout': 'blankLanding',
    'title': 'Encuesta diaria de pacientes con vacuna',
    ...patientVaccine,
  });
};

/**
 * Encuesta diaria de pacientes con vacunas.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 */
function thanksDailySurveyFormOfPatientsWithVaccine(req, res) {
  const patientVaccine = req.session.patientVaccine;
  const caseForm = req.session.caseForm;
  const {
    estado: statusPatientVaccine,
    documento_identidad: numberDocument,
  } = patientVaccine;
  const {
    estado_caso: statusCaseForm,
  } = caseForm;
  if (statusCaseForm == enums.STATUS_CASE_FORM.CLOSED) {
    if (statusPatientVaccine == enums.STATUS_PATIENT.TRAY_NORMAL_VACCINE) {
      res.render('thanks', {
        'layout': 'blankLanding',
        'title': '!Gracias por las respuesta, te llamaremos!',
        'message': `Gracias. Te llemaremos entre hoy y mañana para ampliar este seguimiento.
        En el muy raro caso de emergencia, contactar al Área de epidemiologia al 931344519`,
      });
      return;
    }
    res.render('thanks', {
      'layout': 'blankLanding',
      'title': '!Seguimiento completo!',
      'message': `Muchas gracias por tus respuestas.
    Estaremos en contacto el día de mañana por esta via para comunicar tu seguimiento.`,
    });
    return;
  }
  res.redirect(`/vacuna/encuesta/${numberDocument}`);
  return;
};

module.exports = {
  registrationOfPatientsWithVaccine,
  validatePhoneOfPatientsWithVaccine,
  thanksRegistrationOfPatientsWithVaccine,
  dailySurveyFormOfPatientsWithVaccine,
  thanksDailySurveyFormOfPatientsWithVaccine,
};
