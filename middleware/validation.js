const MESSAGES = require('./../res/string');
const response = require('./../lib/response');
const caseFormModel = require('./../model/casePatientWithVaccineForm');
const enums = require('./../res/enum');

/**
 * Middleware para validar si el paciente con vacuna
 * tiene una encuesta de formulario.
 * @param {Object} req Objeto request.
 * @param {Object} res Objeto response.
 * @param {Function} next Función para seguir la solicitud.
 */
async function patientVaccineHasSurveyForm(req, res, next) {
  const patientVaccine = req.session.patientVaccine;
  if (patientVaccine == null) {
    response.badRequest(res, MESSAGES.ERROR.PATIENT_VACCINE_NO_EXIST);
    return;
  }
  const {
    documento_identidad: numberDocument,
  } = patientVaccine;
  const caseForm = await caseFormModel
      .getByCurrentDayAndNumberDocument(numberDocument);
  if (caseForm == null) {
    response.badRequest(res, MESSAGES.ERROR.CASE_FORM_NO_EXIST);
    return;
  }
  req.session.caseForm = caseForm;
  req.session.save(()=>{
    next();
  });
}

/**
 * Middleware para validar si el paciente con vacuna
 * ya cumplio con su registro.
 * @param {Object} req Objeto request.
 * @param {Object} res Objeto response.
 * @param {Function} next Función para seguir la solicitud.
 */
async function patientVaccineHasPhoneRegistered(req, res, next) {
  const patientVaccine = req.session.patientVaccine;
  if (patientVaccine == null) {
    response.badRequest(res, MESSAGES.ERROR.PATIENT_VACCINE_NO_EXIST);
    return;
  }
  const {
    celular_validado: phoneValidate,
  } = patientVaccine;
  if (phoneValidate == enums.STATUS_PHONE.NOT_REGISTERED) {
    response.badRequest(res, MESSAGES.ERROR.CASE_FORM_NO_EXIST);
    return;
  }
  next();
}

module.exports = {
  patientVaccineHasSurveyForm,
  patientVaccineHasPhoneRegistered,
};
