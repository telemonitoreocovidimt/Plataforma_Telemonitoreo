const masterParametersModel = require('./../model/masterParameters');
const enums = require('./../res/enum');
const response = require('./../lib/response');
const MESSAGES = require('./../res/string');

/**
 * Validar parametros JSON para identificar
 * el tipo de documento y número de documento.
 * Para eso se trata de ubicar los parametros dni y ce.
 * De encontrarlos se agregara al Body del request los campos:
 * typeDocument => 1 (dni) O 2 (ce)
 * numberDocument => Número del documento
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 */
function sanitizeIdentificationDocument(req, res, next) {
  const {dni, ce} = req.body;
  if (dni != '' && dni != null) {
    req.body.typeDocument = 1;
    req.body.numberDocument = dni;
  } else {
    req.body.typeDocument = 2;
    req.body.numberDocument = ce;
  }
  next();
};

/**
 * Obtener parametros maestros de hopitales
 * @param {Object} req request
 * @param {Object} res response
 * @param {Function} next Funcion para continuar
 */
async function sanitizeHospitalMasterParameters(req, res, next) {
  const patient = req.session.patient;
  if (patient == null) {
    response.badRequest(res, MESSAGES.ERROR.PATIENT_COVID_NO_EXIST);
    return;
  }
  const {
    id_hospital: idHospital,
  } = patient;
  const masterParameterHospital = await masterParametersModel
      .get(enums.GROUP_PARAMETERS_HOSPITAL.TERMS, idHospital);
  if (masterParameterHospital == null) {
    response.badRequest(res, MESSAGES.ERROR.GROUP_PARAMETERS_HOSPITAL_NO_EXIST);
    return;
  }
  req.session.masterParameterHospital = masterParameterHospital;
  req.session.save(()=>{
    next();
  });
};

module.exports = {
  sanitizeIdentificationDocument,
  sanitizeHospitalMasterParameters,
};
