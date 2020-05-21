const { openConnection } = require("./connection")
const moment = require('moment-timezone')
const { PGSCHEMA } = require("./../config")

function getTimeNow(restar_day=0, restar_hour=0){
    let date = new Date()
    date.setDate(date.getDate() - restar_day)
    date.setHours(date.getHours() - restar_hour)
    let datePeru = moment.tz(date, "America/Lima");
    let day_string = `${datePeru.year().toString()}-${(datePeru.month() + 1).toString().padStart(2,"0")}-${datePeru.date().toString().padStart(2,"0")}`
    let datePeru_init = `${day_string}T00:00:00.000Z`
    let datePeru_finish = `${day_string}T23:59:59.0000Z`
    let clock_string = `${datePeru.hours().toString().padStart(2,"0")}:${datePeru.minutes().toString().padStart(2,"0")}:${datePeru.seconds().toString().padStart(2,"0")}.${datePeru.milliseconds().toString().padStart(3,'0')}Z`
    let datePeru_current = `${day_string}T${clock_string}`
    return {datePeru_init, datePeru_finish, datePeru_current}
}

function getPatientsSurvey01(){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_current } = getTimeNow()
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_list_patients_survey01($1)`
        let params = [datePeru_current]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}

function getPatientsSurvey02(){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_current } = getTimeNow()
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_list_patients_survey02($1)`
        let params = [datePeru_current]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
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


function save_answer(dni_paciente, variable, respuesta, asked_at, answered_at){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_save_answer($1, $2, $3, $4, $5)`
        let params = [dni_paciente, variable, respuesta, asked_at, answered_at]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}


function patient_change_status(dni_paciente, estado){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_patient_change_status($1, $2)`
        let params = [dni_paciente, estado]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}

function patient_change_risk_factor(dni_paciente, factor_riesgo){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_patient_change_risk_factor($1, $2)`
        let params = [dni_paciente, factor_riesgo]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}

function patient_change_age(dni_paciente, age){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_patient_change_age($1, $2)`
        let params = [dni_paciente, age]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}

function validate_group_case(dni_paciente){
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


//existePatient(req.body.patient_code) sp_save_answer
//development.sp_save_answer(patient_id, answer.variable, answer.answer, answer.asked_at, answer.answered_at) save_answer
// development.sp_patient_change_status(patient_id, 2) patient_change_status
// development.sp_patient_change_status(patient_id, 3)patient_change_status
module.exports = {
    getPatientsSurvey01,
    getPatientsSurvey02,
    existePatient,
    save_answer,
    patient_change_status,
    patient_change_risk_factor,
    patient_change_age,
    validate_group_case
}