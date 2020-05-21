const { openConnection } = require("./connection")
const { PGSCHEMA } = require("./../config")

function patient_excel_01(params){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `SELECT * FROM ${PGSCHEMA}.sp_add_patient_excel_01_test($1,$2,$3,$4,$5,$6,$7,$8)`
        let result = await client.query(query, params)
        client.release(true)
        resolve(result)
    })
}

function patient_excel_02(params){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `SELECT * FROM ${PGSCHEMA}.sp_add_patient_excel_02_test($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`
        let result = await client.query(query, params)
        client.release(true)
        resolve(result)
    })
}

function history(params){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = `SELECT * FROM ${PGSCHEMA}.sp_add_history($1,$2,$3,$4,$5)`
        let result = await client.query(query, params)
        client.release(true)
        resolve(result)
    })
}

module.exports = {
    patient_excel_01,
    patient_excel_02,
    history
}