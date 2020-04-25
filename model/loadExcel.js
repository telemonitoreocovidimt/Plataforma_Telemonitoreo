const { openConnection } = require("./connection")

function patient_excel_01(params){
	//Tipo de Documento
	//1 : DNI
	//2 : Carnet de extranjeria
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = "SELECT * FROM sp_add_patient_excel_01($1,$2,$3,$4,$5,$6,$7,$8,$9)"
        let result = await client.query(query, params)
        client.release(true)
        resolve(result)
    })
}

function patient_excel_02(params){
	//Tipo de Documento
	//1 : DNI
	//2 : Carnet de extranjeria
    //Tipo de Prueba
    //MOLECULAR : MOLECULAR
    //RAPIDA : RAPIDA
    //Resultado de Prueba
    //1 : Negativa
	//2 : Reactiva
	//3 : Positiva
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = "SELECT * FROM sp_add_patient_excel_02($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,"+
        "$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,"+
        "$21,$22,$23,$24,$25,$26,$27)"
        let result = await client.query(query, params)
        client.release(true)
        resolve(result)
    })
}

function history(params){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = "SELECT * FROM sp_add_history($1,$2,$3,$4,$5)"
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