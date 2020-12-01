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
        and (p.fecha_creacion + concat((select param.cantidad_max from ${PGSCHEMA}.dm_parametros as param limit 1)::int, ' days')::interval) = $1;`;
    const params = [peruvianDateCurrent];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

function existePatient(dni_paciente){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.dt_pacientes as p where p.dni = $1`
        let params = [dni_paciente]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}


function saveAnswer(dni_paciente, variable, respuesta, asked_at, answered_at){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_save_answer($1, $2, $3, $4, $5)`
        let params = [dni_paciente, variable, respuesta, asked_at, answered_at]
        console.log(params)
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}

function patientChangeStatus(dni_paciente, estado){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_patient_change_status($1, $2)`
        let params = [dni_paciente, estado]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}



function existsCasePatient(dni_paciente){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.dt_casos_dia
                        where dni_paciente = $1 and fecha_caso = $2`
        let params = [dni_paciente, datePeru_init]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}

function patientChangeRiskFactor(dni_paciente, factor_riesgo){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_patient_change_risk_factor($1, $2)`
        let params = [dni_paciente, factor_riesgo]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}

function patientChangeAge(dni_paciente, age){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_patient_change_age($1, $2)`
        let params = [dni_paciente, age]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}

function validateGroupCase(dni_paciente){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_validate_create_case($1, $2)`
        let params = [dni_paciente, datePeru_init]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}


async function patientIsDoctor(dni_paciente){
    console.log("Patient is doctor")
    console.log(dni_paciente)
    let client = await openConnection()
    let query = `select * from ${PGSCHEMA}.sp_patient_is_doctor($1)`
    let params = [dni_paciente]
    let result = await client.query(query, params)
    client.release(true)
    return result.rows
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
