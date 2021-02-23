const {Router} = require('express');
const router = new Router();
const {isUserParam} = require('./../middleware/auth');
const {generarPDFTerminos} = require('./../controller/report');

router.get('/terms/:dni/pdf', isUserParam, generarPDFTerminos);

module.exports = router;
