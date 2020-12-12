/* eslint "max-len" : ["error", {"code": 120}] */
const json2xls = require('json2xls');
const {validationResult} = require('express-validator');
const {
  getRangeCase,
  getRangeDailySurvey,
  getRangeInitialSurvey} = require('./../model/report');
const {dateToDateString, dateToTimeStampString} = require('./../useful');

/**
 *
 * @function
 * @param {Request} req Solicitud HTTTP
 * @param {Response} res Respuesta HTTP
 */
async function casosDia(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(200).json(error.array());
  }

  const from = dateToDateString(req.params.from);
  const to = dateToDateString(req.params.to);

  let listCase = await getRangeCase(from, to);

  listCase = listCase.map(function(_case) {
    _case['Fecha del caso'] = dateToDateString(_case['Fecha del caso']);
    return _case;
  });

  if (!listCase.length) {
    listCase = [{'': 'No hay resultados, ingrese otro rango de fecha'}];
  }

  const excel = json2xls(listCase);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader('Content-Disposition',
      'attachment; filename=' + `Report_case_${from}_${to}.xlsx`);
  res.end(excel, 'binary');
}

/**
 *
 * @function
 * @param {Request} req Solicitud HTTTP
 * @param {Response} res Respuesta HTTP
 */
async function encuestasIniciales(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(200).json(error.array());
  }

  const from = dateToDateString(req.params.from);
  const to = dateToDateString(req.params.to);

  let listInitialSurvey = await getRangeInitialSurvey(from, to);

  listInitialSurvey = listInitialSurvey.map(function(_survey) {
    _survey['Fin de encuesta'] = dateToTimeStampString(_survey['Fin de encuesta']);
    return _survey;
  });

  if (!listInitialSurvey.length) {
    listInitialSurvey = [{'': 'No hay resultados, ingrese otro rango de fecha'}];
  }

  const excel = json2xls(listInitialSurvey);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader('Content-Disposition', 'attachment; filename=' + `Report_initial_survey_${from}_${to}.xlsx`);
  res.end(excel, 'binary');
}

/**
 *
 * @function
 * @param {Request} req Solicitud HTTTP
 * @param {Response} res Respuesta HTTP
 */
async function encuestasDiarias(req, res) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(200).json(error.array());
  }

  const from = dateToDateString(req.params.from);
  const to = dateToDateString(req.params.to);

  let listDailySurvey = await getRangeDailySurvey(from, to);
  listDailySurvey = listDailySurvey.map(function(_survey) {
    _survey['Fecha del caso'] = dateToTimeStampString(_survey['Fecha del caso']);
    return _survey;
  });

  if (!listDailySurvey.length) {
    listDailySurvey = [{'': 'No hay resultados, ingrese otro rango de fecha'}];
  }
  const excel = json2xls(listDailySurvey);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader('Content-Disposition', 'attachment; filename=' + `Report_daily_survey_${from}_${to}.xlsx`);
  res.end(excel, 'binary');
}

module.exports = {
  casosDia,
  encuestasIniciales,
  encuestasDiarias,
};
