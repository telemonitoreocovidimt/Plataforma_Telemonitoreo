/* eslint max-len: ["error", { "code": 150 }] */
const {validateTerm, updatePatient} = require('./../model/user');
const {addPatientAdmission} = require('./../model/loadExcel');
const {patientChangeStatus} = require('./../model/api');
const {getPatient} = require('./../model/account');
const {makeMigrationsCustomer} = require('./../model/migration');
const {getTimeNow} = require('./../lib/time');

/**
 * Api para validar si un usuario acepto los terminos
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function apiAcceptedTermsByUser(req, res) {
  const dni = req.params.dni;
  const data = await validateTerm(dni);
  const result = data.result;
  const userExists = result.length == 0? false: true;
  let acceptedTerms = 0;
  if (userExists) {
    acceptedTerms = result[0].acepto_terminos;
  }
  return res.json({
    'success': true,
    'accepted_terms': acceptedTerms,
  });
}

/**
 * Guardar paciente
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function savePatient(req, res) {
  const {dni,
    dniPaciente,
    codigo,
    nombre,
    factor,
    direccion,
    celular,
    edad,
    fijo} = req.body;
  console.log(req.body);
  const user = req.session.user;
  if (!dni || !nombre || !celular || !user) {
    return res.status(400).json({
      'success': false,
    });
  }
  const {peruvianDateCurrent, peruvianDateInit} = getTimeNow();
  const idTypeRegister = 2;
  const idTray = 2;
  const jumpInitSurvey = true;
  await addPatientAdmission(dni, codigo, nombre, peruvianDateInit, peruvianDateCurrent,
      direccion, celular, fijo, user.id_hospital, idTypeRegister, jumpInitSurvey);
  await patientChangeStatus(dni, idTray);
  if (dniPaciente) {
    const patient = await getPatient(dniPaciente);
    if (patient) {
      await updatePatient(dni, {
        ...patient,
        factor,
        edad,
      });
    }
  }
  await makeMigrationsCustomer(dni);
  return res.send({
    'success': true,
  });
}

module.exports = {
  apiAcceptedTermsByUser,
  savePatient,
};
