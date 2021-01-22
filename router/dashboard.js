const {Router} = require('express');

const router = new Router();

const {
  takeCase,
  canTakeCase,
  getStatusPatients,
  canTerminateCase,
  terminateCase,
  getCase,
  updateCase,
  dropCase,
  getPatientForCase,
  removeScheduledCase,
  addScheduledCase,
  haveThisScheduledCaseForTomorrow,
  getComentarios,
  getPreviousCases,
  getTreatment,
  deleteTreatment,
  updateTreatment,
  insertTreatment,
  updateRelationshipContactPatient,
  updateContact,
  updateContactMonitor,
  insertContact,
  getContactByid,
  insertRelationshipContactPatient,
  insertContactMonitor,
  getContactMonitorToDay,
  getMonitoreoContactsByDNI,
  deleteRelationshipContactPatient,
  listContacts,
} = require('../model/dashboard');

const {
  getGroups,
  getGroupsContacts
} = require('../useful');

const {
  getInbox,
  getMyInbox,
  getPatientCase,
  savePatientCase,
} = require('./../controller/dashboard');

const {isDoctor} = require('./../middleware/auth');

router.get('/', isDoctor, getInbox);

router.get('/mibandeja', isDoctor, getMyInbox);

router.get('/case/:case', isDoctor, getPatientCase);

router.post('/case/:case', isDoctor, savePatientCase);

module.exports = router;
