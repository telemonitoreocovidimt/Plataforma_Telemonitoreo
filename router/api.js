/* eslint 'max-len': ['error', {'code':100}] */
const {Router} = require('express');
const router = new Router();
const {apiAcceptedTermsByUser, savePatient} = require('./../controller/api');
const {getPatientsSurvey01,
  existsCasePatient,
  getPatientsSurvey02,
  getPatientsSurvey03,
  existePatient,
  saveAnswer,
  patientChangeStatus,
  patientChangeRiskFactor,
  patientChangeAge,
  validateGroupCase,
  updateReasonTestPatient,
  patientIsDoctor} = require('../model/api');
const {makeMigrationsCustomer} = require('../model/migration');
const {casosDia,
  encuestasIniciales,
  encuestasDiarias} = require('../controller/report');
const {check} = require('express-validator');
const {isValidDate} = require('../useful');
const {listContactsByDNI,
  getPatientContactByDNI,
  getContactByDNI,
  getMonitoreoContactsByDNI,
  addPermissionContact,
  removePermissionContact} = require('../model/dashboard');

const {isDNI} = require('../lib/validation');
const CayetanoString = require('../res/string');

/**
 *
 * @function
 * @param {Request} req Solicitud HTTTP
 * @param {Response} res Respuesta HTTP
 */
async function getContact(req, res) {
  const dni = req.query.dni;
  let data = {
    'dni': dni,
    'edad': '',
    'factor_riesgo': false,
    'seguimiento': 0,
    'nombre': '',
    'celular': '',
    'observacion': '',
    'parentesco': '',
    'dia': 1,
    'monitoreo': '',
    'monitoreos': [],
    'tipo_prueba_1': '',
    'resultado_prueba_1': '',
    'fecha_resultado_prueba_1': '',
    'tipo_prueba_2': '',
    'resultado_prueba_2': '',
    'fecha_resultado_prueba_2': '',
    'tipo_prueba_3': '',
    'resultado_prueba_3': '',
    'fecha_resultado_prueba_3': '',
  };
  if (dni) {
    let rs = await getPatientContactByDNI(dni);
    if (rs.result.length > 0) {
      data = {
        ...data,
        ...rs.result[0],
      };
    } else {
      rs = await getContactByDNI(dni);
      if (rs.result.length > 0) {
        data = {
          ...data,
          ...rs.result[0],
        };
      }
    }

    rs = await getMonitoreoContactsByDNI(dni);
    data['monitoreos'] = rs.result;
  }

  for (const key in data) {
    if (data[key] == null) {
      data[key] = '';
    }
  }

  res.json({
    success: true,
    data,
  });
}

/**
 *
 * @function
 * @param {Request} req Solicitud HTTTP
 * @param {Response} res Respuesta HTTP
 */
async function takeContact(req, res) {
  // GET BODY
  const body = req.body;
  const dni_contact = body.dni_contact;
  const dni_patient = body.dni_patient;

  // VALIDATE BODY
  if (!isDNI(dni_contact)) {
    return res.status(400).json({'status': false, 'message': CayetanoString.ERROR.ERROR_MESSAGE_NOT_VALID_DNI, 'field': 'dni_contact'});
  }
  if (!isDNI(dni_patient)) {
    return res.status(400).json({'status': false, 'message': CayetanoString.ERROR.ERROR_MESSAGE_NOT_VALID_DNI, 'field': 'dni_patient'});
  }


  // RUN MODEL FUNCTIONS FOR TASK
  let data = await removePermissionContact(dni_contact, true);
  console.log('Remove : ', data.result);
  data = await addPermissionContact(dni_contact, dni_patient, false, data.client);
  console.log('Add : ', data.result);

  // RETURN ANSWER
  if (data.result.rowCount) {
    return res.status(200).json({'status': true, 'message': CayetanoString.SUCCESS.SUCCESS_MESSAGE_TAKE_CONTACT, 'field': 'dni_patient'});
  } else {
    return res.status(400).json({'status': false, 'message': CayetanoString.ERROR.ERROR_MESSAGE_ERROR_TAKE_CONTACT, 'field': 'dni_patient'});
  }
}

/**
 *
 * @function
 * @param {Request} req Solicitud HTTTP
 * @param {Response} res Respuesta HTTP
 */
async function movePatient(req, res) {
  const dni_patient = req.body.dni_patient;
  if (dni_patient) {
    let rs = await patientChangeStatus(dni_patient, 2);
    rs = await exists_case_patient(dni_patient);


    if (rs.length) {
      await makeMigrationsCustomer(dni_patient);
    }

    return res.json({
      success: rs.length > 0,
    });
  } else {
    return res.json({
      success: false,
    });
  }
}

/**
 * @function
 * @param {JSONArray} patients Lista de pacientes
 * @return {JSON}
 */
function arrayJsonToPatientsList(patients) {
  const listPatients = [];
  patients.forEach((patient) => {
    patient.quiere_seguimiento = patient.quiere_seguimiento == null ? true : patient.quiere_seguimiento;
    if (patient.quiere_seguimiento || patient.quiere_seguimiento.toUpperCase() == 'SI') {
      listPatients.push({
        'code': patient.codigo,
        'identity_document': {
          'number': patient.dni,
        },
        'name': {
          'name': patient.nombre,
          'family_name_1': '',
          'family_name_2': '',
        },
        'mobile_phone': patient.celular,
        'id_hospital': patient.id_hospital,
        'name_hospital': patient.nombre_hospital,
        'accepted_terms': patient.acepto_terminos,
        'historical_pulse': patient.max,
        'monitoring_days': patient.dias_monitoriados,
      });
    }
  });
  return {
    'status': 'ok',
    'details': {
      'patients': listPatients,
    },
  };
}

/**
 * @function
 * @param {*} patient
 * @param {*} answers
 * @param {*} tray
 */
async function answerDailySurvey(patient, answers, tray) {
  const patientId = patient.dni;

  await Promise.all(answers.map(async (answersElement)=>{
    const variable = answersElement.variable;
    const answer = answersElement.answer;
    const askedAt = answersElement.asked_at;
    const answeredAt = answersElement.answered_at;
    await saveAnswer(patientId, variable, answer, askedAt, answeredAt);
  }));

  if (tray == 3 || tray == 2) {
    // tray => 3  pasa a urgencia
    // tray => 2  pasa a bandeja normal
    await patientChangeStatus(patientId, tray);
    await makeMigrationsCustomer(patientId);
  }
}

/**
 * @param {*} patient
 * @param {*} answers
 * @param {*} tray
 */
async function answerFinalSurvey(patient, answers, tray) {
  const patientId = patient.dni;
  // let need_doctor = false;

  await Promise.all(answers.map(async (answersElement)=>{
    const variable = answersElement.variable;
    const answer = answersElement.answer;
    const askedAt = answersElement.asked_at;
    const answeredAt = answersElement.answered_at;
    await saveAnswer(patientId, variable, answer, askedAt, answeredAt);
  }));

  if (tray == 3) {
    // pasa a urgencia
    await patientChangeStatus(patientId, 3);
    await makeMigrationsCustomer(patientId);
  // } else if (need_doctor || tray == 2) {
  } else if (tray == 2) {
    // pasa a bandeja normal
    await patientChangeStatus(patientId, 2);
    await makeMigrationsCustomer(patientId);
  }
  // for (const i in answers) {
  // const variable = answers[i].variable;
  // const answer = answers[i].answer;
  // const asked_at = answers[i].asked_at;
  // const answered_at = answers[i].answered_at;
  // const rows = await save_answer(patient_id, variable, answer, asked_at, answered_at);
  // if((variable == 'dificultad_para_respirar' || variable == 'dolor_pecho' ||
  //     variable == 'confusion_desorientacion' || variable == 'labios_azules') &&
  //     answer.toUpperCase() == 'SI'){
  //     patientToUrgency++
  // }
  // if((variable == 'fiebre_hoy' || variable == 'diarrea') && answer.toUpperCase() == 'SI') {
  //     patientToNormalTray++;
  // }
  // if (variable === 'necesita_medico' && answer.toUpperCase() === 'SI') {
  //   need_doctor = true;
  // }
  // }
}

/**
 * Validar las respuestas de la encuesta inicial.
 * Se guardan todas las respuestas del usuario.
 * Modificara:
 * - edad
 * - factor de riesgo
 * - Es doctor
 * Por ultimo validar tu nuevo estado.
 * @function
 * @param {Object} patient Objeto paciente.
 * @param {JSONArray} answers Lista de respuestas.
 * @param {*} tray
 * @return {Void}
 */
async function answerInitialSurvey(patient, answers, tray) {
  const patientId = patient.dni;
  if (answers.length == 0) {
    return;
  }
  let isRiskFactor = null;
  let patientAge = 0;
  let isDoctor = false;
  await Promise.all(answers.map(async (answersElement)=>{
    const variable = answersElement.variable;
    const answer = answersElement.answer;
    const askedAt = answersElement.asked_at;
    const answeredAt = answersElement.answered_at;
    await saveAnswer(patientId, variable, answer, askedAt, answeredAt);
    if (variable == 'edad_paciente') {
      patientAge = parseInt(answersElement.answer);
    }
    if (variable == 'comorbilidades' && answer.toUpperCase() == 'SI') {
      isRiskFactor = true;
    }
    if (variable == 'comorbilidades' && answer.toUpperCase() == 'NO') {
      isRiskFactor = false;
    }
    if (variable == 'comorbilidades_familiares' && answer.toUpperCase() == 'SI') {
      isRiskFactor = true;
    }
    if (variable === 'es_profesional_salud' && answer.toUpperCase() === 'SI') {
      isDoctor = true;
      isRiskFactor = true;
    }
    if (variable === 'motivo_test_covid' &&
      (answer.toUpperCase() == 'A' || answer.toUpperCase() == 'B' || answer.toUpperCase() == 'C')) {
      isRiskFactor = true;
    }
    if (variable === 'motivo_test_covid') {
      updateReasonTestPatient(answer.toUpperCase(), patientId);
    }
  }));
  if (patientAge != 0) {
    // Update age and flag 'paso_encuesta_inicial'
    await patientChangeAge(patientId, patientAge);
    // Change risk factor and change group
    if (isRiskFactor != null) {
      // Cambia a estado 2 (bandeja normal) y son factor de riesgo
      await patientChangeRiskFactor(patientId, isRiskFactor);
    }
    if (isDoctor) {
      await patientIsDoctor(patientId);
      await patientChangeStatus(patientId, 2);
      await makeMigrationsCustomer(patientId);
    } else {
      // Si es A O B pasan a bandeja o si es C y factor de riesgo
      await validateGroupCase(patientId);
    }
  }
}

router.get('/:survey', async (req, res)=>{
  const params = req.params;
  if (params.survey === 'survey01') {
    const patients = await getPatientsSurvey01();
    return res.json(arrayJsonToPatientsList(patients));
  } else if (params.survey === 'survey02') {
    const patients = await getPatientsSurvey02();
    return res.json(arrayJsonToPatientsList(patients));
  } else if (params.survey === 'survey03') {
    const patients = await getPatientsSurvey03();
    return res.json(arrayJsonToPatientsList(patients));
  }
  return res.json({'status': 'bad'});
});

router.post('/saveAnswers', async (req, res)=>{
  if (req.body.identity_document) {
    const patients = await existePatient(req.body.identity_document);
    if (patients.length) {
      const patient = patients[0];
      const tray = req.body.tray;
      const answers = req.body.answers;
      if (answers == null || answers.length == 0) {
        return res.json({'success': 'bad', 'message': 'No se detectó respuestas.'});
      } else {
        if (req.body.survey == 'encuesta_inicial_covid_19_hch') {
          answerInitialSurvey(patient, answers, tray);
          return res.json({'success': 'ok', 'message': 'Preguntas en proceso de grabado.'});
        } else if (req.body.survey == 'encuesta_monitoreo_covid_19_hch') {
          answerDailySurvey(patient, answers, tray);
          return res.json({'success': 'ok', 'message': 'Preguntas en proceso de grabado.'});
        } else if (req.body.survey == 'encuesta_final_covid_19_hch') {
          answerFinalSurvey(patient, answers, tray);
          res.json({'success': 'ok', 'message': 'Preguntas en proceso de grabado.'});
        }
        return res.json({'success': 'bad', 'message': 'Encuesta inválida'});
      }
    } else {
      res.json({'success': 'bad', 'message': 'Paciente no existe.'});
    }
  } else {
    res.json({'success': 'bad', 'message': 'Estructura invalida.'});
  }
});

const messageErrorDate = 'Tipo de dato invalido, es necesario una fecha.';
const validations = [
  check('from').notEmpty(),
  check('from').custom(isValidDate).withMessage(messageErrorDate),
  check('from').toDate(),
  check('to').notEmpty(),
  check('to').custom(isValidDate).withMessage(messageErrorDate),
  check('to').toDate(),
];

router.get('/report/case/:from/:to', validations, casosDia);

router.get('/report/initial_survey/:from/:to', validations, encuestasIniciales);

router.get('/report/daily_survey/:from/:to', validations, encuestasDiarias);

router.get('/ajax/contact', getContact);

router.put('/ajax/contact', takeContact);

router.get('/ajax/:dni/acceptedTerms', apiAcceptedTermsByUser);

router.post('/tray/move/normal', movePatient);

router.post('/ajax/patient/add', savePatient);

module.exports = router;

// http://localhost:3000/api/v1/report/case/2020-01-20/2020-12-20
// http://localhost:3000/api/v1/report/initial_survey/2020-01-20/2020-12-20
// http://localhost:3000/api/v1/report/daily_survey/2020-01-20/2020-12-20
