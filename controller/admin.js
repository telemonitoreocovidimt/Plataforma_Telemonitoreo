const {excelAdmision, excelTamizaje} = require('./../service/loadExcel');
const patientWithVaccine = require('./../model/patientWithVaccine');
const time = require('./../lib/time');

/**
 * Mostrar la vista de carga de archivos Covid
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function uploadExcel(req, res) {
  await req.useFlash(res);
  return res.render('uploadExcelAdmin', {
    'layout': 'case',
    'islogin': true,
    'nombre': req.session.user.email,
    'nombre_hospital': req.session.user.nombre_hospital,
    'title': 'Upload excels',
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
  console.log(patient);
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
    let errorHTML = '';
    const idHospital = req.session.user.id_hospital;
    const result = await excelAdmision(req.body.fileAdmision.path, idHospital)
        .catch((error) => {
          error.forEach((e) => {
            errorHTML = errorHTML + e + '<br>';
          });
        });
    if (result) {
      await req.flash('success', result);
    } else {
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
    const idHospital = req.session.user.id_hospital;
    let errorHTML = '';
    const result = await excelTamizaje(req.body.fileTamizaje.path, idHospital)
        .catch((error) => {
          error.forEach((e) => {
            errorHTML = errorHTML + e + '<br>';
          });
        });
    if (result) {
      await req.flash('success', result);
    } else {
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
  addPacientVaccine,
};
