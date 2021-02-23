const {Router} = require('express');
const router = new Router();
const middlewareAuth = require('./../middleware/auth');
const middlewareResponse = require('./../middleware/response');
const middlewareValidation = require('./../middleware/validation');
const middlewareSanitizers = require('./../middleware/sanitizers');
const controllerLanding = require('./../controller/landing');

router.get('/terms/:numberDocument', middlewareResponse.responseRender,
    middlewareAuth.isPatientCovid,
    middlewareSanitizers.sanitizeHospitalMasterParameters,
    controllerLanding.terms);

router.post('/terms/:numberDocument', middlewareResponse.responseRender,
    middlewareAuth.isPatientCovid,
    controllerLanding.updateTerms);

router.get('/terms/:numberDocument/thanks', middlewareResponse.responseRender,
    middlewareAuth.isPatientCovid,
    controllerLanding.thanksTerms);
// router.get('/terms/:dni/rejected/thanks',
//     middlewareAuth.isUserParam, controllerLanding.rejectedThanksTerms);

module.exports = router;
