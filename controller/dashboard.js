/* eslint 'max-len': ['error', {'code': 190}] */
const {
  getPatientsAlert,
  getPatients,
  countAllCaseToday,
  countAllCaseAttendedToday,
  countAllCaseAttendedToDayForDoctor,
  countAllCaseAttendedToDayBetweenDoctors,
  getMyPatients,
} = require('./../model/dashboard');
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
  updatePatientTest,
  insertContact,
  getContactByid,
  insertRelationshipContactPatient,
  insertContactMonitor,
  getContactMonitorToDay,
  getMonitoreoContactsByDNI,
  deleteRelationshipContactPatient,
  listContacts,
  getTestReasons,
} = require('./../model/dashboard');

const {
  getGroups,
  getGroupsContacts,
} = require('./../useful');

/**
 * Mostrar la vista de bandejas
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function getInbox(req, res) {
  const dni = req.session.user.dni;
  const idHospital = req.session.user.id_hospital;
  // Obtener bandeja de alertas
  let data = await getPatientsAlert(dni, true);
  const inboxAlert = data.result;

  // Obtener bandejas normal
  data = await getPatients(dni, true, data.client);
  const inboxNormal = data.result;

  // Obtener la cantidad de casos del dia
  data = await countAllCaseToday(idHospital, true, data.client);
  const numberCaseToDay = data.result[0].count;

  // Obtener la cantidad de casos atendidos hoy
  data = await countAllCaseAttendedToday(idHospital, true, data.client);
  const numberCaseAttented = data.result[0].count;

  // Obtener la cantidad de casos atendidos por el usuario hoy
  data = await countAllCaseAttendedToDayForDoctor(dni, true, data.client);
  const numberCaseAttentedByDoctor = data.result[0].count;

  // Obtener y calcular el promedio de atenciones
  data = await countAllCaseAttendedToDayBetweenDoctors(idHospital, false, data.client);
  let count = 0;
  let sum = 0;
  data.result.forEach((json) => {
    count++;
    sum += parseInt(json.count);
  });
  let averageCaseAttented = 0;
  if (count && sum) {
    averageCaseAttented = parseInt(sum / count);
  }
  await req.useFlash(res);
  res.render('dashboard1', {
    'layout': 'main1',
    'islogin': true,
    ...req.session.user,
    inboxAlert,
    inboxNormal,
    numberCaseAttentedByDoctor,
    averageCaseAttented,
    numberCaseToDay,
    numberCaseAttented,
  });
}

/**
 * Mostrar la vista de mi bandejas
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function getMyInbox(req, res) {
  const idHospital = req.session.user.id_hospital;
  const dni = req.session.user.dni;
  // Obtener los casos tomados por el doctor
  data = await getMyPatients(dni, true);
  const myCases = data.result;

  // Obtener la cantidad de casos del dia
  data = await countAllCaseToday(idHospital, true, data.client);
  const numberCaseToDay = data.result[0].count;

  // Obtener la cantidad de casos atendidos hoy
  data = await countAllCaseAttendedToday(idHospital, true, data.client);
  const numberCaseAttented = data.result[0].count;

  // Obtener la cantidad de casos atendidos por el usuario hoy
  data = await countAllCaseAttendedToDayForDoctor(dni, true, data.client);
  const numberCaseAttentedByDoctor = data.result[0].count;

  // Obtener y calcular el promedio de atenciones
  data = await countAllCaseAttendedToDayBetweenDoctors(idHospital, false, data.client);
  let count = 0;
  let sum = 0;
  data.result.forEach((json) => {
    count++;
    sum += parseInt(json.count);
  });
  let averageCaseAttented = 0;
  if (count && sum) {
    averageCaseAttented = parseInt(sum / count);
  }
  await req.useFlash(res);
  return res.render('mycases', {
    'layout': 'main1',
    'islogin': true,
    ...req.session.user,
    myCases,
    numberCaseAttentedByDoctor,
    averageCaseAttented,
    numberCaseToDay,
    numberCaseAttented,
  });
};


/**
 * Mostrar formulario de caso diario
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function getPatientCase(req, res) {
  const idCase = parseInt(req.params.case);
  if (isNaN(idCase)) {
    await req.flash('danger', `Codigo ${idCase}, no es valido.`);
    return res.redirect('/dashboard');
  }
  const dniMedico = req.session.user.dni;
  // Validar si se puede tomar el caso
  const {result} = await canTakeCase(dniMedico, idCase);
  if (result.success) {
    // Obtener paciente del caso
    let data = await getPatientForCase(idCase, true);
    let client = data.client;
    const patient = data.result;
    const dniPaciente = patient.dni;
    const condicionEgreso = patient.condicion_egreso;
    // Validar si se tiene el caso programado
    data = await haveThisScheduledCaseForTomorrow(
        dniMedico,
        dniPaciente,
        true,
        client);
    const haveThisScheduledCase = data.result;
    client = data.client;
    // Tomar caso
    data = await takeCase(idCase, dniMedico, true, client);
    client = data.client;
    // Obtener casos
    data = await getCase(idCase, true, client);
    const myCase = data.result;
    client = data.client;
    //
    data = await getTestReasons(true, client);
    const testReasons = data.results;
    client = data.client;
    // Estados posibles de pacientes
    data = await getStatusPatients(true, client);
    const statementsPatients = data.results;
    client = data.client;
    // Casos previos
    data = await getPreviousCases(dniPaciente, true, client);
    const previousCases = data.results;
    client = data.client;
    // Tratamiento
    data = await getTreatment(idCase, true, client);
    const treatments = data.results;
    // Obtener comentario
    data = await getComentarios(dniPaciente, true, client);
    const comments = data.results;
    // Obtener contactos
    data = await listContacts(dniPaciente, true, client);
    const contacts = data.results;
    client = data.client;
    // Parser contactos a formato JSON
    const contactsJSON = {};
    await Promise.all(
        contacts.map(async function(item) {
          const monitors = await getMonitoreoContactsByDNI(item.dni, true, client);
          contactsJSON[item.dni] = item;
          contactsJSON[item.dni]['monitoreos'] = monitors.results;
        }));
    // Guardar cambios
    client.release(true);
    //
    const contactsString = JSON.stringify(contactsJSON);
    const treatmentsString = JSON.stringify(treatments);
    const groups = [
      {'id': 'A', 'descripcion': 'A'},
      {'id': 'B', 'descripcion': 'B'},
      {'id': 'C', 'descripcion': 'C'},
    ];
    const factors = [
      {'id': true, 'descripcion': 'SI'},
      {'id': false, 'descripcion': 'NO'},
    ];
    const testResults = [
      {'id': '1', 'descripcion': 'Negativo'},
      {'id': '2', 'descripcion': 'Positivo'},
      {'id': '3', 'descripcion': 'Pendiente'},
    ];
    const exitConditions = [
      {'id': '1', 'descripcion': 'Recuperado'},
      {'id': '2', 'descripcion': 'Hospitalizado'},
      {'id': '4', 'descripcion': 'Fallecido'},
      {'id': '3', 'descripcion': 'No desea seguimiento'},
      {'id': '5', 'descripcion': 'Va a ser seguido por otro grupo'},
      {'id': '6', 'descripcion': 'Número no pertenece al paciente'},
      {'id': '7', 'descripcion': 'Paciente no contestó llamadas'},
      {'id': '8', 'descripcion': 'Enfermedad descartada'},
    ];
    // Mensaje 14 dias de seguimiento
    if (myCase.tiempo_seguimiento > 14) {
      await req.flash(
          'danger',
          'Ya tiene más de 14 días, es recomendable dar de alta al paciente.');
    }
    const monitoringStatus = [
      {'id': '0', 'descripcion': '-'},
      {'id': '1', 'descripcion': 'L'},
      {'id': '2', 'descripcion': 'M'},
      {'id': '3', 'descripcion': 'S'},
    ];
    await req.useFlash(res);
    console.log('Contexto GET CASE: ', {
      layout: 'main1',
      contactsString,
      treatmentsString,
      monitoringStatus,
      previousCases,
      haveThisScheduledCase,
      ...myCase,
      // ...data,
      statementsPatients,
      groups,
      factors,
      testResults,
      exitConditions,
      comments,
      condicionEgreso,
      testReasons,
    });
    myCase.can_plus_fv = false;
    if (myCase.sat_fv) {
      myCase.can_plus_fv = true;
    }
    return res.render('formCase', {
      layout: 'main1',
      contactsString,
      treatmentsString,
      monitoringStatus,
      previousCases,
      haveThisScheduledCase,
      ...myCase,
      // ...data,
      statementsPatients,
      groups,
      factors,
      testResults,
      exitConditions,
      comments,
      condicionEgreso,
      testReasons,
    });
  }
  await req.flash('danger', result.message);
  return res.redirect('/dashboard');
};

/**
 * Guardar formulario de caso diario
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function savePatientCase(req, res) {
  const idCase = parseInt(req.params.case);
  if (isNaN(idCase)) {
    await req.flash('danger', `Codigo ${idCase}, no es valido.`);
    return res.redirect('/dashboard');
  }
  const body = req.body;
  console.log('Contexto BODY POST CASE: ', body);
  // Parseo de input checkbox para continuar el tracking para el dia siguiente
  body.continue_tracking = body.continue_tracking === 'on' ? true : false;
  let data = await getPatientForCase(idCase, true);
  let client = data.client;
  const patient = data.result;
  const dniMedico = req.session.user.dni;
  const dniPaciente = patient.dni;
  // Tratamiento
  data = await getTreatment(idCase, true, client);
  client = data.client;
  const treatments = data.results;
  const parseTreatment = getGroups(body, treatments);
  // Eliminar tratamientos
  await Promise.all(parseTreatment.for_drop.map(async function(item) {
    await deleteTreatment(idCase, item.type, true, client);
    return item;
  }));
  // Actualizar tratamientos
  await Promise.all(parseTreatment.for_update.map(async function(item) {
    item.current_using = item.currentusing? true : false;
    item.rea = isNaN(item.rea) ? null : parseInt(item.rea);
    item.det = isNaN(item.det) ? null : parseInt(item.det);
    await updateTreatment(item.id, idCase, item.type, item.name, item.from, item.to, item.obs, item.current_using, item.rea, item.det, true, client);
    return item;
  }));
  // Agregar tratamientos
  await Promise.all(parseTreatment.for_add.map(async function(item) {
    item.current_using = item.currentusing? true : false;
    item.rea = isNaN(item.rea) ? null : parseInt(item.rea);
    item.det = isNaN(item.det) ? null : parseInt(item.det);
    await insertTreatment(idCase, item.type, item.name, item.from, item.to, item.obs, item.current_using, item.rea, item.det, true, client);
    return item;
  }));
  client.release(true);
  // Contacto
  data = await listContacts(dniPaciente, true);
  const contacts = data.results;
  client = data.client;
  const parseContacts = getGroupsContacts(body, contacts);
  // Eliminar contactos
  await Promise.all(parseContacts.for_drop.map(async function(item) {
    await deleteRelationshipContactPatient(item.dni, dniPaciente, true, client);
    return item;
  }));
  // Actualizar contactos
  await Promise.all(parseContacts.for_update.map(async function(item) {
    let rs = await updateRelationshipContactPatient(item.dni, dniPaciente, item.parent, true, client);
    item.factor = item.factor == 'SI';
    item.age = item.age.match(new RegExp('^[0-9]{1,3}$')) ? item.age : null;
    item.phone = item.phone.match(new RegExp('^[0-9]{0,20}$')) ? item.phone : null;
    rs = await updateContact(item.id, '', item.name, item.age, item.factor, item.obs, item.phone, true, client);
    if (item.monitor && item.monitor != '') {
      rs = await getContactMonitorToDay(item.id, true, client);
      if (rs.result.length) {
        rs = await updateContactMonitor(item.id, item.monitor, true, client);
      } else {
        rs = await insertContactMonitor(item.id, item.monitor, true, client);
      }
    }
    const patientsTest = {};
    await Promise.all(Object.keys(item).map(async function(key) {
      if (key.indexOf('&') > -1) {
        const testPatient = key.split('&');
        if (!patientsTest[testPatient[1]]) {
          patientsTest[testPatient[1]] = {};
        }
        patientsTest[testPatient[1]][testPatient[0]] = item[key];
      }
    }));
    await Promise.all(Object.keys(patientsTest).map(async function(key) {
      const patientTest = patientsTest[key];
      await updatePatientTest(key,
          patientTest.tipoprueba1,
          patientTest.fecharesultadoprueba1,
          patientTest.resultadoprueba1,
          patientTest.tipoprueba2,
          patientTest.fecharesultadoprueba2,
          patientTest.resultadoprueba2,
          patientTest.tipoprueba3,
          patientTest.fecharesultadoprueba3,
          patientTest.resultadoprueba3, true, client);
    }));
    // updatePatientTest
    return item;
  }));
  // Agregar contactos
  await Promise.all(parseContacts.for_add.map(async function(item) {
    let rs = await getContactByid(item.dni, true, client);
    item.factor = item.factor == 'SI';
    item.age = item.age.match(new RegExp('^[0-9]{1,3}$')) ? item.age : null;
    item.phone = item.phone.match(new RegExp('^[0-9]{0,20}$')) ? item.phone : null;
    let status = false;
    if (rs.result.length) {
      rs = await updateContact(item.dni, '', item.name, item.age, item.factor, item.obs, item.phone, true, client);
    } else {
      status = true;
      rs = await insertContact(item.dni, '', item.name, item.age, item.factor, item.obs, item.phone, true, client);
    }
    rs = await insertRelationshipContactPatient(item.dni, dniPaciente, item.parent, status, true, client);
    if (item.monitor && item.monitor != '') {
      rs = await getContactMonitorToDay(item.dni, true, client);
      if (rs.result.length) {
        rs = await updateContactMonitor(item.dni, item.monitor, true, client);
      } else {
        rs = await insertContactMonitor(item.dni, item.monitor, true, client);
      }
    }


    const patientsTest = {};
    await Promise.all(Object.keys(item).map(async function(key) {
      if (key.indexOf('&') > -1) {
        const testPatient = key.split('&');
        if (!patientsTest[testPatient[1]]) {
          patientsTest[testPatient[1]] = {};
        }
        patientsTest[testPatient[1]][testPatient[0]] = item[key];
      }
    }));
    await Promise.all(Object.keys(patientsTest).map(async function(key) {
      const patientTest = patientsTest[key];
      await updatePatientTest(key,
          patientTest.tipoprueba1,
          patientTest.fecharesultadoprueba1,
          patientTest.resultadoprueba1,
          patientTest.tipoprueba2,
          patientTest.fecharesultadoprueba2,
          patientTest.resultadoprueba2,
          patientTest.tipoprueba3,
          patientTest.fecharesultadoprueba3,
          patientTest.resultadoprueba3, true, client);
    }));
    return item;
  }));
  client.release(true);
  // Actualizar caso
  await updateCase({
    ...body,
    idCase,
    dniPaciente,
  });
  // Liberar caso
  if (body.tipo_guardado == '3') {
    await removeScheduledCase(dniMedico, dniPaciente);
    await dropCase(idCase);
    await req.flash('warning', 'Caso liberado.');
    return res.redirect('/dashboard');
  }
  // Cerrar caso
  data = await canTerminateCase(dniMedico, idCase);
  const canTerminate = data.result;
  if (canTerminate.pass) {
    const continueTracking = body.continue_tracking;
    delete body.continue_tracking;
    if (continueTracking) {
      await addScheduledCase(dniMedico, dniPaciente);
    } else {
      await removeScheduledCase(dniMedico, dniPaciente);
    }
    // Actualizar caso
    // await updateCase({
    //   ...body,
    //   id_caso: idCase,
    // });
    if (body.tipo_guardado == '2') {
      await terminateCase(idCase, dniMedico);
      await req.flash('success', 'Caso grabado y cerrado exitosamente.');
      return res.redirect('/dashboard');
    }
    await req.flash('success', 'Caso grabado exitosamente.');
    return res.redirect('/dashboard');
  }
  await req.flash('danger', canTerminate.message);
  return res.redirect('/dashboard');
};

module.exports = {
  getInbox,
  getMyInbox,
  getPatientCase,
  savePatientCase,
};
