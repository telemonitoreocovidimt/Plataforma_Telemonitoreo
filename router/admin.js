const {Router} = require('express');
const router = new Router();
const {subirAdmision,
  subirTamizaje,
  adminVaccine,
  uploadExcel,
  searchPatient,
  updatePatient,
  updateCase, addPacientVaccine} = require('./../controller/admin');
const {isAdmin, isAdminCovid, isAdminVaccine} = require('./../middleware/auth');
const ExcelResumeDirector = require('./../DesignPattern/Builder/ExcelResume/ExcelResumeDirector');
const HeaderMultiColumnRowExcelResumeConcreteBuilder = require('./../DesignPattern/Builder/ExcelResume/HeaderMultiColumnRowExcelResumeConcreteBuilder');
const Convert = require('./../util/convert');
const ParameterController = require('../controller/ParameterController')

router.get('/', isAdmin, (req, res, next)=> {
  const {
    id_tipo_seguimiento: idTypeTraking,
  } = req.session.user;
  if (idTypeTraking == 1) {
    return res.redirect('/admin/covid');
  } else {
    return res.redirect('/admin/vacuna');
  }
});

router.get('/vacuna', isAdminVaccine, adminVaccine);

router.post('/vacuna/paciente/agregar', isAdminVaccine, addPacientVaccine);

router.get('/covid', isAdminCovid, uploadExcel);

router.get('/covid/patient', isAdminCovid, searchPatient);

router.post('/covid/case/:caseId', isAdminCovid, updateCase);

router.post('/covid/patient/:patientId', isAdminCovid, updatePatient);

router.post('/respuesta-admision', isAdmin, subirAdmision);

router.post('/respuesta-tamizaje', isAdmin, subirTamizaje);

router.post('/excel/convert', isAdmin, async (req, res) => {
  const fileData = req.files.fileData;
  const fileExclude = req.files.fileExclude;
  const schema = await ParameterController.getParameter('esquema_convertidor_formato');
  if (schema == null || schema == undefined) {
    await req.flash('danger', 'Esquema de formato invalida.');
    res.redirect('back');
    return;
  }
  if (fileData && fileExclude) {
    let headerMultiColumnRowExcelResumeConcreteBuilder = new HeaderMultiColumnRowExcelResumeConcreteBuilder(fileData, [{ 'start': schema.data.headers.start, 'end': schema.data.headers.end }]);
    let excelResumeDirector = new ExcelResumeDirector(headerMultiColumnRowExcelResumeConcreteBuilder);
    await excelResumeDirector.build();
    const dataResumen = excelResumeDirector.getExcelResume();
    headerMultiColumnRowExcelResumeConcreteBuilder = new HeaderMultiColumnRowExcelResumeConcreteBuilder(fileExclude, [{ 'start': schema.exclude.headers.start, 'end': schema.exclude.headers.end }]);
    excelResumeDirector = new ExcelResumeDirector(headerMultiColumnRowExcelResumeConcreteBuilder);
    await excelResumeDirector.build();
    const excludeResumen = excelResumeDirector.getExcelResume();
    if (dataResumen && dataResumen.pages.length > 0 && excludeResumen && excludeResumen.pages.length > 0) {
      const pageData = dataResumen.pages[0];
      const pageExclude = excludeResumen.pages[0];
      const dataFilter = pageData.data.filter((item) => {
        let excluded = false;
        pageExclude.data.forEach((itemExclude) => {
          if (item[schema.data.columnToMatch] == itemExclude[schema.exclude.columnToMatch]) {
            excluded = true;
          }
        });
        return !excluded;
      });
      const workbook = Convert.toExcel(dataFilter, schema.as);
      const buffer = await workbook.xlsx.writeBuffer();
      res.writeHead(200, [
        ['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ["Content-Disposition", "attachment; filename=" + `result.xlsx`]
      ]);
      res.end(Buffer.from(buffer, 'base64'));
    } else {
      await req.flash('danger', 'Documentos enviados son incorrectos.');
      res.redirect('back');
    }
  } else {
    await req.flash('danger', 'Formulario incompleto.');
    res.redirect('back');
  }
});



module.exports = router;
