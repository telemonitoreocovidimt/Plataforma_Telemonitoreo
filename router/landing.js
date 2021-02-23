const {Router} = require('express');
const router = new Router();
const {
  isUserParam,
} = require('./../middleware/auth');
const controllerLanding = require('./../controller/landing');

router.get('/terms/:dni', isUserParam, controllerLanding.terms);
router.post('/terms/:dni', isUserParam, controllerLanding.updateTerms);
router.get('/terms/:dni/thanks', isUserParam, controllerLanding.thanksTerms);
router.get('/terms/:dni/rejected/thanks',
    isUserParam, controllerLanding.rejectedThanksTerms);

// router.get('/vaccine/validation', controllerLanding.validationVaccinePatients);
// router.get('/vaccine/thanks', controllerLanding.ThanksVaccinePatients);
// router.get('/vaccine/survey/:dni', hasCaseToDayPatientVaccineForm,
//     controllerLanding.vaccinePatientSurvey);

module.exports = router;
