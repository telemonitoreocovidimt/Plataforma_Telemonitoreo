const excelToJson = require('convert-excel-to-json')
const { patient_excel_01, patient_excel_02, history } = require('../../model/loadExcel')

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
				C: 'nombre',
				D: 'tipoDocumento',
				E: 'documento',
				F: 'direccion',
				G: 'celular',
				H: 'fijo'
			}
		});
		const rows = result[Object.keys(result)[0]]
		let error = validateAdmision(rows)
		if(error.length !== 0){
			reject(error)
		}else{
			rows.forEach((row, i) => {
				const rowNumber = i+2
				let params = []
				params.push(row.documento)
				params.push(row.numero)
				params.push(row.nombre)
				params.push(row.fecha)
				params.push(row.fecha)
				params.push(tipoDocumentoPG(row.tipoDocumento))
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
		isRequired(row.nombre, 'C', rowNumber, error)
		isRequired(row.tipoDocumento, 'D', rowNumber, error)
		isRequired(row.documento, 'E', rowNumber, error)
		isRequired(row.direccion, 'F', rowNumber, error)
		isRequired(row.celular, 'G', rowNumber, error)
		isRequired(row.fijo, 'H', rowNumber, error)
		isDate(row.fecha, 'B', rowNumber, error)
		parseTipoDocumento(row.tipoDocumento, 'D', rowNumber, error)
		parsePhoneNumber(row.celular, 'G', rowNumber, error)
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

function tipoDocumentoPG(tipoDocumento){
	let result=null
	if(tipoDocumento.toUpperCase() === 'DNI'){
		result=1
	}
	if(tipoDocumento.toUpperCase() === 'CARNET DE EXTRANJERIA'){
		result=2
	}
	return result
}

function excel_tamizaje(excel){
    return new Promise((resolve, reject)=>{
        
    })
}

module.exports = {
    excel_admision,
    excel_tamizaje
}