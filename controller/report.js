/* eslint "max-len" : ["error", {"code": 130}] */
const json2xls = require('json2xls');
const {validationResult} = require('express-validator');
const {
  getRangeCase,
  getRangeDailySurvey,
  getRangeInitialSurvey,
  getPatientsTrayVaccine,
  getPatientsVaccine} = require('./../model/report');
const {dateToDateString, dateToTimeStampString} = require('./../useful');
const {generatePDFTerms} = require('./../lib/pdf');
const {getMasterParameterHospital} = require('./../model/masterParameters');
const {getTimeNow} = require('./../lib/time');
const time = require('./../lib/time');
const enums = require('./../res/enum');


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
  // console.log(listDailySurvey);
  // console.log('--------------------------');
  listDailySurvey = listDailySurvey.map(function(_survey) {
    // console.log(_survey);
    _survey['Fin de encuesta'] = dateToTimeStampString(_survey['Fin de encuesta']);
    return _survey;
  });
  // console.log('--------------------------');
  // console.log(listDailySurvey);
  if (!listDailySurvey.length) {
    listDailySurvey = [{'': 'No hay resultados, ingrese otro rango de fecha'}];
  }
  const excel = json2xls(listDailySurvey);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader('Content-Disposition', 'attachment; filename=' + `Report_daily_survey_${from}_${to}.xlsx`);
  res.end(excel, 'binary');
}

/**
 *
 * @function
 * @param {Request} req Solicitud HTTTP
 * @param {Response} res Respuesta HTTP
 */
async function generarPDFTerminos(req, res) {
  const patient = req.session.patient;
  if (patient == null) {
    response.badRequest(res, MESSAGES.ERROR.PATIENT_COVID_NO_EXIST);
    return;
  }
  const masterParameterHospital = req.session.masterParameterHospital;
  if (masterParameterHospital == null) {
    response.badRequest(res, MESSAGES.ERROR.GROUP_PARAMETERS_HOSPITAL_NO_EXIST);
    return;
  }
  const {
    dni: numberDocument,
    nombre: namePatient,
    tipo_documento: typeDocument,
    acepto_terminos: acceptedTerms,
    acepto_terminos_datos: acceptedTermsData,
  } = patient;
  const {
    descripcion: contactDescription,
  } = masterParameterHospital;

  const peruvianDateInit = time.getTimeNow().peruvianDateInit;
  const typeDocumentDescription = typeDocument == enums.TYPE_DOCUMENT.CE ?
    'CE' : typeDocument == enums.TYPE_DOCUMENT.DNI? 'DNI' : '';
  const currentDay = peruvianDateInit.substring(0, 10);
  const acceptTermDataBool = acceptedTermsData == enums.STATUS_TERMS.ACCEPTED ? true : false;
  const acceptTermBool = acceptedTerms == enums.STATUS_TERMS.ACCEPTED ? true : false;
  const pdfBuffer = await generatePDFTerms(contactDescription, namePatient, typeDocumentDescription,
      numberDocument, currentDay, acceptTermDataBool, acceptTermBool);
  res.contentType('application/pdf');
  return res.send(pdfBuffer);
}


/**
 *
 * @function
 * @param {Request} req Solicitud HTTTP
 * @param {Response} res Respuesta HTTP
 */
async function generateExcelPatientsTrayVaccine(req, res) {
  let listInitialSurvey = await getPatientsTrayVaccine();

  if (!listInitialSurvey.length) {
    listInitialSurvey = [{'': 'No hay resultados, ingrese otro rango de fecha'}];
  }

  const excel = json2xls(listInitialSurvey);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader('Content-Disposition', 'attachment; filename=' + `Report_Patients_Tray_Vaccine.xlsx`);
  res.end(excel, 'binary');
}

/**
 *
 * @function
 * @param {Request} req Solicitud HTTTP
 * @param {Response} res Respuesta HTTP
 */
async function generateExcelgetPatientsVaccine(req, res) {
  let listInitialSurvey = await getPatientsVaccine();
  if (!listInitialSurvey.length) {
    listInitialSurvey = [{'': 'No hay resultados, ingrese otro rango de fecha'}];
  }

  const excel = json2xls(listInitialSurvey);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
  res.setHeader('Content-Disposition', 'attachment; filename=' + `Report_Patients_Vaccine.xlsx`);
  res.end(excel, 'binary');
}

module.exports = {
  casosDia,
  encuestasIniciales,
  encuestasDiarias,
  generarPDFTerminos,
  generateExcelPatientsTrayVaccine,
  generateExcelgetPatientsVaccine,
};
