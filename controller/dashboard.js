/* eslint 'max-len': ['error', {'code': 90}] */
const {
  getPatientsAlert,
  getPatients,
  countAllCaseToday,
  countAllCaseAttendedToday,
  countAllCaseAttendedToDayForDoctor,
  countAllCaseAttendedToDayBetweenDoctors,
  getMyPatients,
} = require('./../model/dashboard');

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
  console.log(req.session.user);
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

module.exports = {
  getInbox,
  getMyInbox,
};
