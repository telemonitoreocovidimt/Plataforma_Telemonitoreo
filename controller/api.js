/* eslint max-len: ["error", { "code": 150 }] */
const fs = require('fs');

const expressValidator = require('express-validator');
const {validateTerm, updatePatient} = require('./../model/user');
const {addPatientAdmission} = require('./../model/loadExcel');
const {patientChangeStatus} = require('./../model/api');
const {getPatient} = require('./../model/account');
const migration = require('./../model/migration');
const {getTimeNow} = require('./../lib/time');
const patientWithVaccineModel = require('../model/patientWithVaccine');
const casePatientWithVaccineFormModel = require('../model/casePatientWithVaccineForm');
const casePatientWithVaccineModel = require('../model/casePatientWithVaccine');
const enums = require('./../res/enum');
const generate = require('./../lib/generate');
const movistar = require('./../lib/movistar');
const time = require('./../lib/time');

const apiController = require('./ApiController');

/** Builder **/
const ExcelPagetDirector = require('../DesignPattern/Builder/ExcelResume/ExcelResumeDirector.js');
const VaccinatedPatientsExceltConcreteBuilder = require('../DesignPattern/Builder/ExcelResume/VaccinatedPatientsExcelResumeConcreteBuilder.js');
const { throws } = require('assert');


/**
 * Api para validar si un usuario acepto los terminos
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function apiAcceptedTermsByUser(req, res) {
  const dni = req.params.dni;
  const data = await validateTerm(dni);
  const result = data.result;
  const userExists = result.length == 0? false: true;
  let acceptedTerms = 0;
  if (userExists) {
    acceptedTerms = result[0].acepto_terminos;
  }
  return res.json({
    'success': true,
    'accepted_terms': acceptedTerms,
  });
}

/**
 * Guardar paciente
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function savePatient(req, res) {
  const {dni,
    dniPaciente,
    codigo,
    nombre,
    factor,
    direccion,
    celular,
    edad,
    fijo} = req.body;
  const user = req.session.user;
  if (!dni || !nombre || !celular || !user) {
    return res.status(400).json({
      'success': false,
    });
  }
  const {peruvianDateCurrent, peruvianDateInit} = getTimeNow();
  const idTypeRegister = 2;
  const idTray = 2;
  const jumpInitSurvey = true;
  await addPatientAdmission(dni, codigo, nombre, peruvianDateInit, peruvianDateCurrent,
      direccion, celular, fijo, user.id_hospital, idTypeRegister, jumpInitSurvey);
  await patientChangeStatus(dni, idTray);
  if (dniPaciente) {
    const patient = await getPatient(dniPaciente);
    if (patient) {
      await updatePatient(dni, {
        ...patient,
        factor,
        edad,
      });
    }
  }
  await migration.makeMigrationsCustomer(dni);
  return res.send({
    'success': true,
  });
}

/**
 * Api para validar registro de pacientes con vacuna.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function apiRegistrationPatientsWithVaccine(req, res) {
  const error = expressValidator.validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json(error.array());
  }
  // Parametros
  const {
    typeDocument,
    numberDocument,
    email,
    onSiteWork,
    phone,
  } = req.body;
  // Validar si existe el paciente con vacuana con los mismos documentos de identidad
  let patient = await patientWithVaccineModel.exist(numberDocument, typeDocument);
  if (!patient) {
    return res.status(200).json({
      'message': `El documento de identidad ${numberDocument} no se encuentra registrado en el padrón, 
      favor regístrese haciendo clic <a target="_blank" href="https://forms.gle/7BExo7XaUXBAnE2cA">aquí</a>.`,
      'status': false,
    });
  }
  const lastPhone = patient.celular;
  const phoneValidated = patient.celular_validado;
  patient = {
    ...patient,
    'documento_identidad': numberDocument,
    'celular': phone,
    'email': email == ''? null: email,
    'trabajo_presencial': onSiteWork ? 2: 1,
    'celular_validado': 1,
  };
  if (patient.fecha_respuesta_registro != null) {
    const daysPassed = (new Date(time.getTimeNow().peruvianDateInit) - patient.fecha_respuesta_registro_date) / (1000 * 3600 * 24);
    if (daysPassed >= 14) {
      if (patient.fecha_respuesta_registro_2 != null) {
        return res.status(200).json({
          'message': 'Usted ya esta registrado y esta siendo monitoreado diariamente.',
          'status': false,
        });
      } else {
        patient.fecha_respuesta_registro_2 = time.getTimeNow().peruvianDateCurrent;
      }
    } else {
      return res.status(200).json({
        'message': 'Usted ya esta registrado y esta siendo monitoreado diariamente.',
        'status': false,
      });
    }
  } else {
    patient.fecha_respuesta_registro = time.getTimeNow().peruvianDateCurrent;
  }
  const codeGenerated = generate.generateCode();
  if (lastPhone == phone && phoneValidated == 2) {
    patient.celular_validado = 2;
  } else {
    // Enviar codigo de activación
    const message = `Tu codigo de verificación es ${codeGenerated}.`;
    movistar.sendSMS(phone, message);
  }
  // Actualizar datos del paciente
  await patientWithVaccineModel.update(patient);
  // Guardar sesión temporal
  req.session.tempPatientWithVaccineRegister = {
    ...patient,
    ...req.body,
    codeGenerated,
  };
  req.session.save(function() {
    return res.json({
      'status': true,
    });
  });
};

/**
 * Api para validar registro de pacientes con covid.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function apiValidationVaccinePatients(req, res) {
  const error = expressValidator.validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json(error.array());
  }
  if (!req.session.tempPatientWithVaccineRegister) {
    return res.json({
      'status': true,
      'message': 'Usted no tiene una sesión en curso.',
    });
  }
  const {
    typeDocument,
    numberDocument,
    codeGenerated,
  } = req.session.tempPatientWithVaccineRegister;
  const {
    code,
  } = req.body;

  // Validar codigo de verificación.
  const phoneValidate = code == codeGenerated;
  if (!phoneValidate) {
    return res.status(200).json({
      'message': 'Código de verificación equivocado.',
      'status': false,
    });
  }

  // Obtener datos del paciente con vacuna.
  let patient = await patientWithVaccineModel.exist(numberDocument, typeDocument);
  if (!patient) {
    return res.status(200).json({
      'message': 'Paciente no existe en el padrón, intente nuevamente con otro documento de identidad.',
      'status': false,
    });
  }

  // Actualizar datos del paciente
  patient = {
    ...patient,
    'celular_validado': 2,
    'fecha_validacion': time.getTimeNow().peruvianDateCurrent,
  };
  await patientWithVaccineModel.update(patient);

  return res.json({
    'status': true,
  });
};

/**
 * Api para guardar respuestas del formulario para pacientes vacuandos.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 */
async function apiVaccinePatientSurveyForm(req, res) {
  const patientVaccine = req.session.patientVaccine;
  const caseForm = req.session.caseForm;
  if (patientVaccine == null) {
    response.badRequest(res, MESSAGES.ERROR.PATIENT_VACCINE_NO_EXIST);
    return;
  }
  if (caseForm == null) {
    response.badRequest(res, MESSAGES.ERROR.CASE_FORM_NO_EXIST);
    return;
  }
  const error = expressValidator.validationResult(req);
  if (!error.isEmpty()) {
    res.status(400).json(error.array());
    return;
  }
  const {
    documento_identidad: numberDocument,
    puntuacion: lastPoints,
  } = patientVaccine;
  const {
    fecha_creacion_caso: createDateCaseForm,
  } = caseForm;
  const {
    piel,
    dolor,
    fiebre,
    fatiga,
    cabeza,
    confusion,
    adormecimiento,
    diarrea,
    otros,
  } = req.body;
  let points = 0;
  if (dolor) {
    points += 1;
  }
  if (fiebre) {
    points += 3;
  }
  if (fatiga) {
    points += 1;
  }
  if (cabeza) {
    points += 1;
  }
  if (confusion) {
    points += 5;
  }
  if (adormecimiento) {
    points += 5;
  }
  if (diarrea) {
    points += 4;
  }
  if (otros) {
    points += 4;
  }
  if (piel) {
    points += 5;
  }
  const casePatientWithVaccine = {
    ...caseForm,
    dolor: dolor? 2: 1,
    fiebre: fiebre? 2: 1,
    fatiga: fatiga? 2: 1,
    cabeza: cabeza? 2: 1,
    confusion: confusion? 2: 1,
    adormecimiento: adormecimiento? 2: 1,
    diarrea: diarrea? 2: 1,
    otros: otros? 2: 1,
    piel: piel? 2: 1,
    fecha_creacion: createDateCaseForm,
    fecha_respondido: time.getTimeNow().peruvianDateCurrent,
    estado: 2,
    puntuacion: points,
  };
  await casePatientWithVaccineFormModel.updateCasePatientWithVaccineForm(casePatientWithVaccine);
  await patientWithVaccineModel.update({
    ...patientVaccine,
    puntuacion: points,
    estado: points > 0? enums.STATUS_PATIENT.TRAY_NORMAL_VACCINE : enums.STATUS_PATIENT.TRAY_SMS,
  });
  const caseCurrentDay = await casePatientWithVaccineModel
      .getByCurrentDayAndNumberDocument(numberDocument);
  const createCase = async ()=> {
    if (points > 0) {
      await migration.makeMigrationsPatientWithVaccine(numberDocument);
    } else if (points == 0 && lastPoints > 0) {
      await migration.makeMigrationsPatientWithVaccineImproved(numberDocument);
    }
  };
  if (!(points == 0 && lastPoints == 0)) {
    if (caseCurrentDay == null ) {
      await createCase();
    } else {
      const {
        id: idCase,
        estado: statusCase,
      } = caseCurrentDay;
      switch (statusCase) {
        case enums.STATUS_CASE.CLOSED: await createCase(); break;
        case enums.STATUS_CASE.CLOSED_SYSTEM: await createCase(); break;
        case enums.STATUS_CASE.PENDING: await casePatientWithVaccineModel.closeBySystem(idCase); await createCase(); break;
        case enums.STATUS_CASE.TAKED: await casePatientWithVaccineModel.closeBySystem(idCase); await createCase(); break;
      }
    }
  }
  return res.json({
    'status': true,
  });
};

/**
 * Api para validar registro de pacientes con covid.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function apiRegistrationPatientsWithVaccineValidated(req, res) {
  const error = expressValidator.validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json(error.array());
  }
  // Parametros
  const {
    typeDocument,
    numberDocument,
    email,
    onSiteWork,
    phone,
  } = req.body;

  // Validar si existe el paciente con vacuana con los mismos documentos de identidad
  let patient = await patientWithVaccineModel.exist(numberDocument, typeDocument);
  if (!patient) {
    return res.status(200).json({
      'message': `El documento de identidad ${numberDocument} no se encuentra registrado en el padrón, 
                favor regístrese haciendo clic <a target="_blank" href="https://forms.gle/7BExo7XaUXBAnE2cA">aquí</a>.`,
      'status': false,
    });
  }
  if (patient.fecha_respuesta_registro != null) {
    return res.status(200).json({
      'message': 'Usted ya esta registrado y esta siendo monitoreado diariamente.',
      'status': false,
    });
  }
  patient = {
    ...patient,
    'documento_identidad': numberDocument,
    'celular': phone,
    'email': email == ''? null: email,
    'trabajo_presencial': onSiteWork ? 2: 1,
    'celular_validado': 2,
    'fecha_respuesta_registro': time.getTimeNow().peruvianDateCurrent,
    'fecha_validacion': time.getTimeNow().peruvianDateCurrent,
  };
  // Actualizar datos del paciente
  await patientWithVaccineModel.update(patient);

  return res.json({
    'status': true,
  });
};

/**
 * Api para validar si un usuario acepto los terminos
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
 async function apiUploadVaccinatedPatients (req, res) {
  const filePatientsVaccinated = req.files.filePatientsVaccinated;
  if (filePatientsVaccinated) {
    const vaccinatedPatientsExceltConcreteBuilder = new VaccinatedPatientsExceltConcreteBuilder(filePatientsVaccinated);
    const excelPagetDirector = new ExcelPagetDirector(vaccinatedPatientsExceltConcreteBuilder);
    await excelPagetDirector.build();
    const excelResume = excelPagetDirector.getExcelResume();
    if (excelResume.size > 0) {
      try {
        if (excelResume.pages[0].exceptions.length > 0) {
          throw excelResume.pages[0].exceptions.join('<br/>');
        }
        const countRows = await apiController.uploadVaccinatedPatients(excelResume.pages[0].data);
        console.log('Subir pacientes vacunados');
        console.log('success', `Se insertaron ${countRows} registros.`);
        await req.flash('success', `Se insertaron ${countRows} registros.`);
      } catch (error) {
        console.log('Error');
        console.log(error);
        await req.flash('danger', error);
      }
    } else {
      await req.flash('danger', 'No hay registros en el excel.');
    }
  } else {
    await req.flash('danger', 'No hay archivo.');
  }
  return res.redirect('back');
}


module.exports = {
  apiAcceptedTermsByUser,
  savePatient,
  apiRegistrationPatientsWithVaccine,
  apiValidationVaccinePatients,
  apiVaccinePatientSurveyForm,
  apiRegistrationPatientsWithVaccineValidated,
  apiUploadVaccinatedPatients,
};
