const {Router} = require('express');
const router = new Router();
const dashboardController = require('./../controller/dashboard');
const middleware = require('./../middleware/auth');

router.get('/', middleware.isDoctor, (req, res)=>{
  const {
    id_hospital: idHospital,
  } = req.session.user;
  if (idHospital == 3) {
    return res.redirect('/dashboard/bandejas/vacuna');
  }
  return res.redirect('/dashboard/bandejas/covid');
});

/* Covid */

router.get('/bandejas/covid',
    middleware.isDoctorCOVID, dashboardController.getInbox);

router.get('/mibandeja/covid',
    middleware.isDoctorCOVID, dashboardController.getMyInbox);

router.get('/caso/covid/:case',
    middleware.isDoctorCOVID, dashboardController.getPatientCase);

router.post('/caso/covid/:case',
    middleware.isDoctorCOVID, dashboardController.savePatientCase);

/* Vacunas */

router.get('/bandejas/vacuna',
    middleware.isDoctorVaccine, dashboardController.getInboxVaccine);

router.get('/mibandeja/vacuna',
    middleware.isDoctorVaccine, dashboardController.getMyInboxVaccine);

router.get('/caso/vacuna/:case',
    middleware.isDoctorVaccine, dashboardController.getPatientCaseVaccine);

router.post('/caso/vacuna/:case',
    middleware.isDoctorVaccine, dashboardController.savePatientCaseVaccine);

module.exports = router;
