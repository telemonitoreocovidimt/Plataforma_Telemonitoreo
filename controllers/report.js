const json2xls = require('json2xls')
const { validationResult } = require('express-validator')
const { getRangeCase, getRangeDailySurvey, getRangeInitialSurvey } = require("./../model/report")
const { dateToDateString } = require("./../useful")

async function casos_dia(req, res){

    let error = validationResult(req)
    if(!error.isEmpty())
        return res.status(200).json(error.array())

    let from = req.params.from
    let to = req.params.to
    
    let listCase = await getRangeCase(from, to)
    if(!listCase.length)
        listCase = [{"Nota":"No hay resultados, ingrese otro rango de fecha"}]
    let excel = json2xls(listCase)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats')
  	res.setHeader("Content-Disposition", "attachment; filename=" + `Report_case_${dateToDateString(from)}_${dateToDateString(to)}.xlsx`)
    res.end(excel, 'binary')
}

async function encuestas_iniciales(req, res){

    let error = validationResult(req)
    if(!error.isEmpty())
        return res.status(200).json(error.array())
        
    let from = req.params.from
    let to = req.params.to
    
    let listCase = await getRangeInitialSurvey(from, to)
    if(!listCase.length)
        listCase = [{"":"No hay resultados"}]
    let excel = json2xls(listCase)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats')
    res.setHeader("Content-Disposition", "attachment; filename=" + `Report_initial_survey_${dateToDateString(from)}_${dateToDateString(to)}.xlsx`)
    res.end(excel, 'binary')
}


async function encuestas_diarias(req, res){

    let error = validationResult(req)
    if(!error.isEmpty())
        return res.status(200).json(error.array())
        
    let from = req.params.from
    let to = req.params.to
    
    let listCase = await getRangeDailySurvey(from, to)
    if(!listCase.length)
        listCase = [{"":"No hay resultados"}]
    let excel = json2xls(listCase)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats')
    res.setHeader("Content-Disposition", "attachment; filename=" + `Report_daily_survey_${dateToDateString(from)}_${dateToDateString(to)}.xlsx`)
    res.end(excel, 'binary')
}

module.exports = {
    casos_dia,
    encuestas_iniciales,
    encuestas_diarias
}