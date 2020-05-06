const excelToJson = require('convert-excel-to-json')
const { patient_excel_01, patient_excel_02, history } = require('../../model/loadExcel')
const moment = require('moment-timezone')


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

function excel_admision(excel){
    return new Promise((resolve, reject)=>{
        const result = excelToJson({
			sourceFile: excel,
			header:{
		    	rows: 1
			},
			columnToKey: {
				A: 'numero',
				B: 'fecha',
				C: 'apellidoPaterno',
				D: 'apellidoMaterno',
				E: 'nombre',
				F: 'documento',
				G: 'direccion',
				H: 'celular',
				I: 'fijo'
			}
		});
		const rows = result[Object.keys(result)[0]]
		let error = validateAdmision(rows)
		if(error.length !== 0){
			reject(error)
		}else{
			let { datePeru_current } = getTimeNow()
			rows.forEach((row, i) => {
				const rowNumber = i+2
				let params = []

				params.push(row.documento)
				params.push(row.numero)
				params.push(concatApellidosNombrePG(row.apellidoPaterno, row.apellidoMaterno, row.nombre))
				params.push(row.fecha)
				params.push(datePeru_current)
				params.push(row.direccion)
				params.push(row.celular)
				params.push(row.fijo)

				patient_excel_01(params).then((resolvedValue) => {

				}, (error) => {
					error.push('No se pudo ingresar en la BD la fila '+rowNumber)
				});
			})
			if(error.length !== 0){
				reject({error : error})
			}else{
				resolve({result: 'La Carga fue exitosa'})
			}
		}
    })
}

function validateAdmision(rows){
	let error = []
	rows.forEach((row, i) => {
		const rowNumber = i+2
		isRequired(row.numero, 'A', rowNumber, error)
		isRequired(row.fecha, 'B', rowNumber, error)
		isRequired(row.apellidoPaterno, 'C', rowNumber, error)
		isRequired(row.apellidoMaterno, 'D', rowNumber, error)
		isRequired(row.nombre, 'E', rowNumber, error)
		isRequired(row.documento, 'F', rowNumber, error)
		isRequired(row.celular, 'H', rowNumber, error)
		isDate(row.fecha, 'B', rowNumber, error)
		parsePhoneNumber(row.celular, 'G', rowNumber, error)
	})
	return error
}

function excel_tamizaje(excel){
    return new Promise((resolve, reject)=>{
        const result = excelToJson({
			sourceFile: excel,
			header:{
		    	rows: 1
			},
			columnToKey: {
				A: 'numero',
				B: 'semanaEpid',
				C: 'fecha',
				D: 'documento',
				E: 'nombre',
				F: 'edad',
				G: 'sexo',
				H: 'celular',
				I: 'pais',
				J: 'provincia',
				K: 'distrito',
				L: 'direccion',
				M: 'fechaSintomas',
				N: 'fechaMuestra',
				O: 'tipoMuestra1',
				P: 'resultadoMuestra1',
				Q: 'fechaResultado1',
				R: 'tipoMuestra2',
				S: 'resultadoMuestra2',
				T: 'fechaResultado2',
				U: 'tipoMuestra3',
				V: 'resultadoMuestra3',
				W: 'fechaResultado3',
				X: 'destino',
				Y: 'lugar',
				Z: 'clasificacion',
				AA: 'evolucion1',
				AB: 'evolucion2'
			}
		})
		const rows = result[Object.keys(result)[0]]
		let error = validateTamizaje(rows)
		if(error.length !== 0){
			reject(error)
		}else{
			let { datePeru_current } = getTimeNow()
			rows.forEach((row, i) => {
				const rowNumber = i+2
				
				let paramsPatient = []
				let paramsHistory = []

				paramsPatient.push(row.documento.toString())
				paramsPatient.push(row.numero)
				paramsPatient.push(row.nombre)
				paramsPatient.push(row.fecha)
				paramsPatient.push(datePeru_current)
				paramsPatient.push(row.direccion)
				paramsPatient.push(row.celular)
				paramsPatient.push(null)
				paramsPatient.push(row.fechaMuestra)

				paramsPatient.push(resultadoMuestra(row.resultadoMuestra1))
				paramsPatient.push(row.fechaResultado1 == undefined ? null : row.fechaResultado1)
				paramsPatient.push(tipoPrueba(row.tipoMuestra1))

				paramsPatient.push(resultadoMuestra(row.resultadoMuestra2))
				paramsPatient.push(row.fechaResultado2 == undefined ? null : row.fechaResultado2)
				paramsPatient.push(tipoPrueba(row.tipoMuestra2))

				paramsPatient.push(resultadoMuestra(row.resultadoMuestra3))
				paramsPatient.push(row.fechaResultado3 == undefined ? null : row.fechaResultado3)
				paramsPatient.push(tipoPrueba(row.tipoMuestra3))

				paramsPatient.push(row.sexo)
				paramsPatient.push(row.pais)
				paramsPatient.push(row.provincia)
				paramsPatient.push(row.distrito)
				paramsPatient.push(row.fechaSintomas)

				paramsPatient.push(confirmacionCovid19(row.clasificacion))

				paramsHistory.push(row.documento)
				paramsHistory.push(row.destino)
				paramsHistory.push(row.lugar)
				paramsHistory.push(row.clasificacion)
				paramsHistory.push(formatoEvolucion(row.evolucion1, row.evolucion2))
				console.log("JSON paciente : ", paramsPatient)
				patient_excel_02(paramsPatient).then((resolvedValue) => {
					history(paramsHistory).then((resolvedValue) => {
					}, (error) => {
						error.push('No se pudo ingresar en la BD la fila '+rowNumber)
					});
				}, (error) => {
					error.push('No se pudo ingresar en la BD la fila '+rowNumber)
				});
				
			})
			if(error.length !== 0){
				reject({error : error})
			}else{
				resolve({result: 'La Carga fue exitosa'})
			}
		}
    })
}

function validateTamizaje(rows){
	let error = []
	rows.forEach((row, i) => {
		const rowNumber = i+2
		isRequired(row.numero, 'A', rowNumber, error)
		isRequired(row.semanaEpid, 'B', rowNumber, error)
		isRequired(row.fecha, 'C', rowNumber, error)
		isRequired(row.documento, 'D', rowNumber, error)
		isRequired(row.nombre, 'E', rowNumber, error)
		isRequired(row.edad, 'F', rowNumber, error)
		isRequired(row.sexo, 'G', rowNumber, error)
		isRequired(row.celular, 'H', rowNumber, error)
		isRequired(row.pais, 'I', rowNumber, error)
		isRequired(row.provincia, 'J', rowNumber, error)
		isRequired(row.distrito, 'K', rowNumber, error)
		isRequired(row.direccion, 'L', rowNumber, error)
		isRequired(row.lugar, 'Y', rowNumber, error)
		isRequired(row.clasificacion, 'Z', rowNumber, error)
		isDate(row.fecha, 'C', rowNumber, error)
		isDate(row.fechaSintomas, 'M', rowNumber, error)
		isDate(row.fechaMuestra, 'N', rowNumber, error)
		isDate(row.fechaResultado1, 'Q', rowNumber, error)
		isDate(row.fechaResultado2, 'T', rowNumber, error)
		isDate(row.fechaResultado3, 'W', rowNumber, error)
		parsePhoneNumber(row.celular, 'H', rowNumber, error)
		parseTipoMuestra(row.tipoMuestra1, 'O', rowNumber, error)
		parseTipoMuestra(row.tipoMuestra2, 'R', rowNumber, error)
		parseTipoMuestra(row.tipoMuestra3, 'U', rowNumber, error)
		parseResultadoMuestra(row.resultadoMuestra1, 'P', rowNumber, error)
		parseResultadoMuestra(row.resultadoMuestra2, 'S', rowNumber, error)
		parseResultadoMuestra(row.resultadoMuestra3, 'V', rowNumber, error)
		parseClasificacion(row.clasificacion, 'Z', rowNumber, error)

	})
	return error
}

function isRequired(data, column, row, error){
	if(data === null || data === undefined ){
		error.push(column+row+' es obligatorio')
	}
}

function isDate(data, column, row, error){
	if(data !== null && data !== undefined && !(data instanceof Date)){
		error.push(column+row+' debe ser de tipo Fecha')
	}
}

function parseTipoDocumento(data, column, row, error){
	if(data !== null && data !== undefined && 
		data.toUpperCase() !== 'DNI' && 
		data.toUpperCase() !== 'CARNET DE EXTRANJERIA' ){
			error.push(column+row+' solo puede tener los siguientes valores DNI o CARNET DE EXTRANJERIA')
	}
}

function parsePhoneNumber(data, column, row, error) {
	if(data !== null && data !== undefined && 
		(data.toString().length !== 9 || !(/^(9)([0-9]{8})$/.test(data)))) {
		error.push(column+row+' el telefono debe comenzar con 9 y ser de 9 digitos')
	}
}

function parseTipoMuestra(data, column, row, error) {
	if(data !== null && data !== undefined && 
		data.toUpperCase() !== 'RAPIDA' && 
		data.toUpperCase() !== 'P RAPIDA' && 
		data.toUpperCase() !== 'P. RAPIDA' &&
		data.toUpperCase() !== 'HISOPADO NASOFARINGEO Y OROFARINGEO' && 
		data.toUpperCase() !== 'MOLECULAR' && 
		data.toUpperCase() !== 'NO TIENE' ){
			console.info(data)
			error.push(column+row+' solo puede tener los siguientes valores P RAPIDA, HISOPADO NASOFARINGEO Y OROFARINGEO, MOLECULAR, NO TIENE')
	}
}

function parseResultadoMuestra(data, column, row, error) {
	if(data !== null && data !== undefined && 
		data.toUpperCase() !== 'POSITIVO' && 
		data.toUpperCase() !== 'REACTIVO' && 
		data.toUpperCase() !== 'NEGATIVO' && 
		data.toUpperCase() !== 'PENDIENTE' ){
			error.push(column+row+' solo puede tener los siguientes valores POSITIVO, REACTIVO, NEGATIVO, PENDIENTE')
	}	
}

function parseClasificacion(data, column, row, error) {
	if(data !== null && data !== undefined && 
		data.toUpperCase() !== 'DESCARTADO' && 
		data.toUpperCase() !== 'SOSPECHOSO' && 
		data.toUpperCase() !== 'CONFIRMADO' ){
			error.push(column+row+' solo puede tener los siguientes valores DESCARTADO, SOSPECHOSO, CONFIRMADO')
	}
}

function concatApellidosNombrePG(apellidoPaterno, apellidoMaterno, nombre){
	let result=apellidoPaterno + ' ' + apellidoMaterno + ' ' + nombre
	return result
}

function resultadoMuestra(resultado){
	let result=null
	if(resultado) {
		if(resultado.toUpperCase() === 'NEGATIVO'){
			result = 1
		}
		else if(resultado.toUpperCase() === 'REACTIVO'){
			result = 2
		}
		else if(resultado.toUpperCase() === 'POSITIVO'){
			result = 2
		}
	}
	return result
}

function tipoPrueba(tipo){
	let result=null
	if(tipo) {
		if(tipo.toUpperCase() === 'RAPIDA'){
			result = 'RAPIDA'
		}
		if(tipo.toUpperCase() === 'P RAPIDA'){
			result = 'RAPIDA'
		}
		if(tipo.toUpperCase() === 'P. RAPIDA'){
			result = 'RAPIDA'
		}
		if(tipo.toUpperCase() === 'HISOPADO NASOFARINGEO Y OROFARINGEO'){
			result = 'MOLECULAR'
		}
		if(tipo.toUpperCase() === 'MOLECULAR'){
			result = 'MOLECULAR'
		}
	}
	return result
}

function confirmacionCovid19(rpta) {
	let result=false
	if(rpta) {
		if(rpta.toUpperCase() == 'CONFIRMADO' || rpta.toUpperCase() == 'DESCARTADO')
			result = true
	}
	return result
}

function formatoEvolucion(evolucion1, evolucion2) {
	let result = ''
	if(evolucion1 !== undefined){
		result = evolucion1
	}
	if(evolucion2 !== undefined){
		result = result + ' ' + evolucion2
	}
	return result
}

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

module.exports = {
    excel_admision,
    excel_tamizaje
}