const {Router} = require('express');
const router = new Router();
const {isUserParam} = require('./../middleware/auth');
const controllerReport = require('./../controller/report');
const middlewareAuth = require('./../middleware/auth');
const middlewareResponse = require('./../middleware/response');
const middlewareValidation = require('./../middleware/validation');
const middlewareSanitizers = require('./../middleware/sanitizers');
const controllerLanding = require('./../controller/landing');

router.get('/terms/:numberDocument/pdf', middlewareResponse.responseRender,
    middlewareAuth.isPatientCovid,
    middlewareSanitizers.sanitizeHospitalMasterParameters,
    controllerReport.generarPDFTerminos);

module.exports = router;
