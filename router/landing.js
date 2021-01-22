const {Router} = require('express');
const router = new Router();
const {isUserParam} = require('./../middleware/auth');
const {terms,
  thanksTerms,
  updateTerms,
  rejectedThanksTerms} = require('./../controller/landing');

router.get('/terms/:dni', isUserParam, terms);
router.post('/terms/:dni', isUserParam, updateTerms);
router.get('/terms/:dni/thanks', isUserParam, thanksTerms);
router.get('/terms/:dni/rejected/thanks', isUserParam, rejectedThanksTerms);

module.exports = router;
