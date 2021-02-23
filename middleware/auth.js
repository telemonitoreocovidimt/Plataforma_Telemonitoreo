/* eslint max-len: ['error', {'code':90}] */
const {getInfoPatient} = require('./../model/user');
const patientWithVaccine = require('../model/patientWithVaccine');
const validation = require('./../lib/validation');
const MESSAGES = require('./../res/string');
const patientVaccineModel = require('./../model/patientWithVaccine');
const enums = require('./../res/enum');
const response = require('./../lib/response');

/**
 * Validar si es un usuario administrador
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
function isAdmin(req, res, next) {
  if (req.session.isAdmin) {
    return next();
  }
  return res.redirect('/');
}

/**
 * Validar si es un usuario administrador y hace seguimiento covid.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
function isAdminCovid(req, res, next) {
  if (req.session.isAdmin) {
    const {
      id_tipo_seguimiento: idTypeTraking,
    } = req.session.user;
    if (idTypeTraking == 1) {
      return next();
    }
    return res.send('No tienes permisos suficientes.');
  }
  return res.redirect('/');
}

/**
 * Validar si es un usuario administrador y hace seguimiento covid.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
function isAdminVaccine(req, res, next) {
  if (req.session.isAdmin) {
    const {
      id_tipo_seguimiento: idTypeTraking,
    } = req.session.user;
    if (idTypeTraking == 2) {
      return next();
    }
    return res.send('No tienes permisos suficientes.');
  }
  return res.redirect('/');
}

/**
 * Validar si es un doctor.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
function isDoctor(req, res, next) {
  if (req.session.user) {
    if (!req.session.isAdmin) {
      return next();
    }
  }
  return res.send('No tienes permisos suficientes.');
}

/**
 * Validar si es un doctor que seguira pacientes con COVID.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
function isDoctorCOVID(req, res, next) {
  if (req.session.user) {
    const {
      id_hospital: idHospital,
    } = req.session.user;
    if (!req.session.isAdmin && idHospital != 3) {
      return next();
    }
  }
  return res.send('No tienes permisos suficientes.');
}

/**
 * Validar si es un doctor que seguira pacientes con vacunas.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
function isDoctorVaccine(req, res, next) {
  if (req.session.user) {
    const {
      id_hospital: idHospital,
    } = req.session.user;
    if (!req.session.isAdmin && idHospital == 3) {
      return next();
    }
  }
  return res.send('No tienes permisos suficientes.');
}

/**
 * Middleware para validar si es un paciente con vacuna segun el parametro
 * por url con su Documento de identidad.
 * @param {Object} req Objeto request.
 * @param {Object} res Objeto response.
 * @param {Function} next Función para seguir la solicitud.
 */
async function isPatientVaccine(req, res, next) {
  // Obtener y validar paramtros
  const numberDocument = req.params.numberDocument;
  const isTypeDni = validation.isDNI(numberDocument);
  const isTypeCe = validation.isCE(numberDocument);
  if (!(isTypeDni || isTypeCe)) {
    response.badRequest(res, MESSAGES.ERROR.NUMBER_DOCUMENT_NO_VALID);
    return;
  }
  const typeDocument = isTypeCe? enums.TYPE_DOCUMENT.CE : enums.TYPE_DOCUMENT.DNI;

  // Validar si existe el paciente
  const patientVaccine = await patientVaccineModel.exist(numberDocument, typeDocument);
  if (patientVaccine == null) {
    response.badRequest(res, MESSAGES.ERROR.PATIENT_VACCINE_NO_EXIST);
    return;
  }

  req.session.patientVaccine = patientVaccine;
  req.session.save(()=>{
    next();
  });
}

/**
 * Validar si es un doctor o voluntario
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
async function isUserParam(req, res, next) {
  const dni = req.params.dni;
  const result = await getInfoPatient(dni);
  console.log(result);
  if (result.result.length) {
    req.session.userTemp = result.result[0];
    return req.session.save(()=>{
      next();
    });
  } else {
    return res.redirect('/');
  }
}

/**
 * Validar si es una paciente con vacuna y si tiene una caso programado
 * para el dia actual.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
async function validateExistsPatientWithVaccineCaseForm(req, res, next) {
  const numberDocument = req.params.numberDocument;
  const formCase = await patientWithVaccine
      .getCasePatientVaccineForm(numberDocument);
  // Validar si el paciente tiene un caso
  if (formCase) {
    req.session.tempPatientWithVaccineSurvey = formCase;
    // Validar si el estado del caso no es PENDIENTE (1)
    if (req.session.tempPatientWithVaccineSurvey.estado_caso != 1) {
      return res.render('thanks', {
        'layout': 'blankLanding',
        'title': 'Encuenta realizada',
        'message': `Usted ya respondio la encuesta diaria programada para hoy, 
                      intentelo mañana.`,
      });
    }
    return req.session.save(()=>{
      return next();
    });
  } else {
    return res.render('thanks', {
      'layout': 'blankLanding',
      'title': 'No tiene encuesta para hoy',
      'message': `No tiene encuesta diaria programada para hoy, 
                    intentelo mas tarde.`,
    });
  }
}

/**
 * Validar si es una paciente con vacuna y si tiene una caso programado
 * para el dia actual.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
async function validateExistsPatientWithVaccineCaseFormNotStrict(req, res, next) {
  const numberDocument = req.params.numberDocument;
  const formCase = await patientWithVaccine.getCasePatientVaccineForm(numberDocument);
  if (formCase) {
    req.session.tempPatientWithVaccineSurvey = formCase;
    return req.session.save(()=>{
      return next();
    });
  } else {
    return res.render('thanks', {
      'layout': 'blankLanding',
      'title': 'No tiene encuesta para hoy',
      'message': `No tiene encuesta diaria programada para hoy, 
                    intentelo mas tarde.`,
    });
  }
}

/**
 * Validar token en cabecera
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 * @return {Object}
 */
async function validateTokenAPi(req, res, next) {
  const tokenAccess = 'Token e115444d-c6cb-4012-bf0b-51b4f53fd434';
  const token = req.header('Authentication');
  if (tokenAccess === token) {
    return next();
  }
  return res.status(401).send({
    'status': false,
    'message': 'Token no valído.',
  });
}

// /**
//  * Validar token en cabecera
//  * @param {Object} req request
//  * @param {Object} res response
//  * @param {Function} next Funcion para continuar
//  * @return {Object}
//  */
// function () {

// }


module.exports = {
  isAdmin,
  isAdminCovid,
  isAdminVaccine,
  isDoctor,
  isDoctorVaccine,
  isDoctorCOVID,
  isUserParam,
  isPatientVaccine,
  validateExistsPatientWithVaccineCaseForm,
  validateExistsPatientWithVaccineCaseFormNotStrict,
  validateTokenAPi,
};
