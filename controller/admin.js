const {excelAdmision, excelTamizaje} = require('./../service/loadExcel');
const patientWithVaccine = require('./../model/patientWithVaccine');
const time = require('./../lib/time');
const adminController = require('./AdminController');
const patientController = require('./PatientController');
const doctorController = require('./DoctorController');
const caseController = require('./CaseController');
const ParameterController = require('./ParameterController');
/**
 * Mostrar la vista de carga de archivos Covid
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function uploadExcel(req, res) {
  await req.useFlash(res);
  const patientTrays = [
    {'id': 1, 'descripcion': 'Bandeja Bot'},
    {'id': 2, 'descripcion': 'Bandeja Normal'},
    {'id': 3, 'descripcion': 'Bandeja Urgente'},
    {'id': 4, 'descripcion': 'Alta'},
  ];
  const patientGroups = [
    {'id': 'A', 'descripcion': 'A'},
    {'id': 'B', 'descripcion': 'B'},
    {'id': 'C', 'descripcion': 'C'},
  ];
  const patientFactors = [
    {'id': true, 'descripcion': 'SI'},
    {'id': false, 'descripcion': 'NO'},
  ];
  const medicals = await doctorController.getDoctorList(req.session.user.id_hospital);
  const statusCase = [
    { "id": 1, "description": "En cola"},
    { "id": 2, "description": "Atención en progreso"},
    { "id": 3, "description": "Atención completado"},
    { "id": 4, "description": "Cerrado por el sistema"}
  ]
  const schema = await ParameterController.getParameter('esquema_convertidor_formato');
  return res.render('uploadExcelAdmin', {
    'layout': 'case',
    'islogin': true,
    'nombre': req.session.user.email,
    'nombre_hospital': req.session.user.nombre_hospital,
    'title': 'Upload excels',
    patientFactors,
    patientGroups,
    patientTrays,
    statusCase,
    medicals,
    'schema': JSON.stringify(schema),
  });
}


/**
 * Obtener pacientes con casos
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
 async function searchPatient(req, res) {
  let {query} = req.query;
  query = query == undefined ? '' : query;
  const {id_hospital} = req.session.user;
  const patients = await patientController.searchPatient(query, id_hospital);
  return res.json(patients);
}

/**
 * Actualizar caso
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
 async function updateCase(req, res) {
  let {caseId} = req.params;
  const body = req.body;
  const rowCount = await caseController.update(caseId, body);
  return res.json({
    "rowCount": rowCount
  });
}


/**
 * Actualizar paciente
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
 async function updatePatient(req, res) {
  let {patientId} = req.params;
  const body = req.body;
  const rowCount = await patientController.update(patientId, body);
  return res.json({
    "rowCount": rowCount
  });
}

/**
 * Mostrar la vista de administrador vacunas
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function adminVaccine(req, res) {
  await req.useFlash(res);

  const typeDocumentOptions = [{
    'id': 1,
    'descripcion': 'DNI',
  }, {
    'id': 2,
    'descripcion': 'CR',
  }];
  return res.render('vaccineAdmin', {
    'layout': 'case',
    'islogin': true,
    'nombre': req.session.user.email,
    'nombre_hospital': req.session.user.nombre_hospital,
    'title': 'Upload excels',
    typeDocumentOptions,
  });
}

/**
 * Agregar pacientes con vacuna.
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function addPacientVaccine(req, res) {
  const body = req.body;
  const patient= {
    ...body,
    trabajo_presencial: body.trabajo_presencial == 'on' ? 2 : 1,
    nota_grupo: null,
    estado: 5,
    fecha_creacion: body.fecha_validacion,
    celular_validadado: 2,
    fecha_ultima_modificacion: time.getTimeNow().peruvianDateCurrent,
    puntuacion: null,
    id_hospital: req.session.user.id_hospital,
    fecha_respuesta_registro: body.fecha_validacion,
  };
  const rowCount = await patientWithVaccine.insert(patient);
  if (rowCount > 0) {
    await req.flash('success', 'Paciente creado.');
  } else {
    await req.flash('danger', 'Error creando al paciente.');
  }
  return res.redirect('back');
}

/**
 * Validar el archivo de excel para subir admitidos
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function subirAdmision(req, res) {
  if (req.body.fileAdmision) {
    console.log("Admision");
    const comment = req.body.comment;
    const tray = req.body.tray == 'on';
    const sent_today = req.body.sent_today == 'on';
    let errorHTML = '';
    const idHospital = req.session.user.id_hospital;
    console.log("Path del archivo: " + req.body.fileAdmision.path);
    console.log("Enviar directo a bandeja: " + tray);
    console.log("Mostrar hoy en las bandejas: " + sent_today);
    console.log("Comentario: " + comment);
    const result = await excelAdmision(req.body.fileAdmision.path, idHospital)
        .catch((error) => {
          error.forEach((e) => {
            errorHTML = errorHTML + e + '<br>';
          });
        });
    if (result) {
      await adminController.updateGroupNote(result.documentNumberList, comment);
      if (tray) {
        await adminController.sentToDashboard(result.documentNumberList);
        if (sent_today) {
          await adminController.forceSentToDashboard(result.documentNumberList,)
        }
      }
      await req.flash('success', result.message);
    } else {
      console.log("Errores: " + errorHTML);
      await req.flash('danger', errorHTML);
    }
  } else {
    await req.flash('danger', 'No ha seleccionado ningún Excel de Admisión');
  }
  return res.redirect('back');
}

/**
 * Validar el archivo de excel para subir tamizaje
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function subirTamizaje(req, res) {
  if (req.body.fileTamizaje) {
    console.log("Tamizaje");
    const comment = req.body.comment;
    const tray = req.body.tray == 'on';
    const sent_today = req.body.sent_today == 'on';
    const idHospital = req.session.user.id_hospital;
    console.log("Path del archivo: " + req.body.fileTamizaje.path);
    console.log("Enviar directo a bandeja: " + tray);
    console.log("Mostrar hoy en las bandejas: " + sent_today);
    console.log("Comentario: " + comment);
    let errorHTML = '';
    const result = await excelTamizaje(req.body.fileTamizaje.path, idHospital)
        .catch((error) => {
          error.forEach((e) => {
            errorHTML = errorHTML + e + '<br>';
          });
        });
    if (result) {
      await adminController.updateGroupNote(result.documentNumberList, comment);
      if (tray) {
        await adminController.sentToDashboard(result.documentNumberList);
        if (sent_today) {
          await adminController.forceSentToDashboard(result.documentNumberList,)
        }
      }
      await req.flash('success', result.message);
    } else {
      console.log("Errores: " + errorHTML);
      await req.flash('danger', errorHTML);
    }
  } else {
    await req.flash('danger', 'No ha seleccionado ningún Excel de Tamizaje');
  }
  return res.redirect('back');
}

module.exports = {
  subirAdmision,
  subirTamizaje,
  uploadExcel,
  adminVaccine,
  searchPatient,
  addPacientVaccine,
  updateCase,
  updatePatient,
};
