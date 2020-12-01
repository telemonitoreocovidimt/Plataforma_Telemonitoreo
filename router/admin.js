const {Router} = require('express');
const router = new Router();
const {subirAdmision,
  subirTamizaje,
  uploadExcel} = require('./../controller/admin');
const {isAdmin} = require('./../middleware/auth');


router.get('/', isAdmin, uploadExcel);

router.post('/respuesta-admision', isAdmin, subirAdmision);

router.post('/respuesta-tamizaje', isAdmin, subirTamizaje);

module.exports = router;
