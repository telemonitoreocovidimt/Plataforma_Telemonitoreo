/* eslint max-len : ["error", {"code": 100}] */

const {Router} = require('express');
const router = new Router();
const vaccineController = require('./../controller/vaccine');
const middlewareAuth = require('./../middleware/auth');
const middlewareResponse = require('./../middleware/response');
const middlewareValidation = require('./../middleware/validation');

// Registro de pacientes
router.get('/', vaccineController.registrationOfPatientsWithVaccine);
router.get('/validar', vaccineController.validatePhoneOfPatientsWithVaccine);
router.get('/gracias', vaccineController.thanksRegistrationOfPatientsWithVaccine);

router.get('/encuesta/:numberDocument', middlewareResponse.responseRender,
    middlewareAuth.isPatientVaccine,
    middlewareValidation.patientVaccineHasPhoneRegistered,
    middlewareValidation.patientVaccineHasSurveyForm,
    vaccineController.dailySurveyFormOfPatientsWithVaccine);

router.get('/encuesta/:numberDocument/gracias', middlewareResponse.responseRender,
    middlewareAuth.isPatientVaccine,
    middlewareValidation.patientVaccineHasPhoneRegistered,
    middlewareValidation.patientVaccineHasSurveyForm,
    vaccineController.thanksDailySurveyFormOfPatientsWithVaccine);

module.exports = router;
