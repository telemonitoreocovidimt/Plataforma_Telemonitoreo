const {excelAdmision, excelTamizaje} = require('./../service/loadExcel');

/**
 * Mostrar la vista de carga de archivos
 * @function
 * @param {Object} req request
 * @param {Object} res response
 * @return {Object}
 */
async function uploadExcel(req, res) {
  await req.useFlash(res);
  return res.render('upload_excel', {
    'layout': 'case',
    'islogin': true,
    'nombre': req.session.user.email,
    'nombre_hospital': req.session.user.nombre_hospital,
    'title': 'Upload excels',
  });
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
};
