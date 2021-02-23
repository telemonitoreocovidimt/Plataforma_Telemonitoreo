const {Router} = require('express');
const router = new Router();
const {subirAdmision,
  subirTamizaje,
  adminVaccine,
  uploadExcel,
  addPacientVaccine} = require('./../controller/admin');
const {isAdmin, isAdminCovid, isAdminVaccine} = require('./../middleware/auth');


router.get('/', isAdmin, (req, res, next)=> {
  const {
    id_tipo_seguimiento: idTypeTraking,
  } = req.session.user;
  if (idTypeTraking == 1) {
    return res.redirect('/admin/covid');
  } else {
    return res.redirect('/admin/vacuna');
  }
});

router.get('/vacuna', isAdminVaccine, adminVaccine);

router.post('/vacuna/paciente/agregar', isAdminVaccine, addPacientVaccine);

router.get('/covid', isAdminCovid, uploadExcel);

router.post('/respuesta-admision', isAdmin, subirAdmision);

router.post('/respuesta-tamizaje', isAdmin, subirTamizaje);

module.exports = router;
