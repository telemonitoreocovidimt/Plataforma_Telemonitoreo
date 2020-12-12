/* eslint "max-len": ["error", {"code":200}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');
const {getTimeNow} = require('./../lib/time');

/**
 * Obtener la lista de usuarios para la encuesta inicial.
 * @return {Promise}
 */
function getPatientsSurvey01() {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateCurrent} = getTimeNow();
    const client = await openConnection();
    // let query = `select * from ${PGSCHEMA}.sp_list_patients_survey01($1)`
    const query = `select p.codigo, p.dni, p.nombre, p.celular, p.acepto_terminos, p.id_hospital, h.descripcion nombre_hospital from ${PGSCHEMA}.dt_pacientes as p
                inner join dm_hospitales as h
                on p.id_hospital = h.id
                where p.paso_encuesta_inicial = false and p.estado = 1 and 
                (p.fecha_creacion + concat((select param.cantidad_max from ${PGSCHEMA}.dm_parametros as param limit 1)::int, ' days')::interval) > $1 and 
                p.fecha_creacion < $1;`;
    const params = [peruvianDateCurrent];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * Obtener la lista de usuarios para la encuesta diaria.
 * @return {Promise}
 */
function getPatientsSurvey02() {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateCurrent} = getTimeNow();
    const client = await openConnection();
    // let query = `select * from ${PGSCHEMA}.sp_list_patients_survey02($1)`
    const query = `select p.codigo, p.dni, p.nombre, p.celular, p.acepto_terminos, p.id_hospital, h.descripcion nombre_hospital from ${PGSCHEMA}.dt_pacientes as p
            inner join dm_hospitales as h
            on p.id_hospital = h.id
            where p.grupo = 'C'
            and p.is_doctor = false
            and p.factor_riesgo = false
            and p.estado = 1
            and p.paso_encuesta_inicial = true
            and (p.fecha_creacion + concat((select param.cantidad_max from ${PGSCHEMA}.dm_parametros as param limit 1)::int, ' days')::interval) >= $1 and 
            p.fecha_creacion < $1;`;
    const params = [peruvianDateCurrent];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * Obtener la lista de usuarios para la encuesta final.
 * @return {Promise}
 */
function getPatientsSurvey03() {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateCurrent} = getTimeNow();
    const client = await openConnection();
    // let query = `select * from ${PGSCHEMA}.sp_list_patients_survey03($1)`
    const query = `select p.codigo, p.dni, p.nombre, p.celular, p.acepto_terminos, p.id_hospital, h.descripcion nombre_hospital from ${PGSCHEMA}.dt_pacientes as p
        inner join dm_hospitales as h
        on p.id_hospital = h.id
        where p.grupo = 'C'
        and p.is_doctor = false
        and p.factor_riesgo = false
        and p.estado = 1
        and p.paso_encuesta_inicial = true
        and (p.fecha_creacion + concat((select param.cantidad_max from ${PGSCHEMA}.dm_parametros as param limit 1)::int, ' days')::interval)::date = $1::date;`;
    const params = [peruvianDateCurrent];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * @param {String} dniPaciente DNI del paciente
 * @return {Promise}
 */
function existePatient(dniPaciente) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.dt_pacientes as p where p.dni = $1`;
    const params = [dniPaciente];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * @param {String} dniPaciente DNI del paciente
 * @param {String} variable Id pregunta
 * @param {String} respuesta Respuesta
 * @param {Date} askedAt Fecha en la que fue preguntada
 * @param {Date} answeredAt Fecha en la que fue respondida
 * @return {Promise}
 */
function saveAnswer(dniPaciente, variable, respuesta, askedAt, answeredAt) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.sp_save_answer($1, $2, $3, $4, $5)`;
    const params = [dniPaciente, variable, respuesta, askedAt, answeredAt];
    console.log(params);
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * @param {String} dniPaciente DNI del paciente
 * @param {Number} estado  Id del estado nuevo
 * @return {Promise}
 */
function patientChangeStatus(dniPaciente, estado) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.sp_patient_change_status($1, $2)`;
    const params = [dniPaciente, estado];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * @param {String} dniPaciente DNI del paciente
 * @return {Promise}
 */
function existsCasePatient(dniPaciente) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.dt_casos_dia
                        where dni_paciente = $1 and fecha_caso = $2`;
    const params = [dniPaciente, peruvianDateInit];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * @param {String} dniPaciente DNI del paciente
 * @param {Boolean} factorRiesgo Es o no factor de riesgo
 * @return {Promise}
 */
function patientChangeRiskFactor(dniPaciente, factorRiesgo) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.sp_patient_change_risk_factor($1, $2)`;
    const params = [dniPaciente, factorRiesgo];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * @param {String} dniPaciente DNI del paciente
 * @param {Number} age Edad del paciente
 * @return {Promise}
 */
function patientChangeAge(dniPaciente, age) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.sp_patient_change_age($1, $2)`;
    const params = [dniPaciente, age];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * @param {String} dniPaciente DNI del paciente
 * @return {Promise}
 */
function validateGroupCase(dniPaciente) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.sp_validate_create_case($1, $2)`;
    const params = [dniPaciente, peruvianDateInit];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * @param {String} dniPaciente DNI del paciente
 * @return {Promise}
 */
async function patientIsDoctor(dniPaciente) {
  console.log('Patient is doctor');
  console.log(dniPaciente);
  const client = await openConnection();
  const query = `select * from ${PGSCHEMA}.sp_patient_is_doctor($1)`;
  const params = [dniPaciente];
  const result = await client.query(query, params);
  client.release(true);
  return result.rows;
}


module.exports = {
  getPatientsSurvey01,
  getPatientsSurvey02,
  getPatientsSurvey03,
  existePatient,
  saveAnswer,
  patientChangeStatus,
  patientChangeRiskFactor,
  patientChangeAge,
  validateGroupCase,
  patientIsDoctor,
  existsCasePatient,
};
