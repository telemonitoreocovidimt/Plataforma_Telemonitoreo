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
const ParameterController = require('../controller/ParameterController');
const ReportController = require('../controller/ReportController');
const fs = require('fs');

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

router.post('/excel/schema', isAdmin, async (req, res) => {
  const rowCountUpdated = await ParameterController.setParameter('esquema_convertidor_formato', req.body);
  if (rowCountUpdated > 0) {
    res.send({
      'message': 'Esquema actualizada correctamente.'
    });
  } else {
    res.status(400).send({
      'message': 'No se pudo actualizar el esquema.'
    });
  }
  
});

router.get('/report/pagination/:filename', isAdmin, async (req, res) => {
  const filename = req.params.filename;
  const reporte = fs.readFileSync(`./public/report/${filename}.json`, 'utf8');
  const reportJson= JSON.parse(reporte);
  res.send({
    page: reportJson.length == 0 ? reportJson.length : parseInt(reportJson.length / 10000) + 1
  });
});

router.get('/report/excel/:filename', isAdmin, async (req, res) => {
  const filename = req.params.filename;
  const page = req.query.page ? req.query.page: 1;
  if (page <= 0) {
    return res.send({message: 'Pagina no existe.'});
  } 
  const report = fs.readFileSync(`./public/report/${filename}.json`, 'utf8');
  const reportJson = JSON.parse(report);
  const data = reportJson.slice((page * 10000) - 10000, page * 10000);
  const pageMax = reportJson.length == 0 ? reportJson.length : parseInt(reportJson.length / 10000) + 1;
  if (page > pageMax) {
    return res.send({message: 'Pagina no existe.'});
  } 
  const workbook = await Convert.jsonArrayToExcel(data);
  console.log('workbook created!');
  const buffer = await workbook.xlsx.writeBuffer();
  console.log('buffer created!')
  res.writeHead(200, [
    ['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ["Content-Disposition", "attachment; filename=" + `report_part_${page}/${pageMax}.xlsx`]
  ]);
  res.end(Buffer.from(buffer, 'base64'));
  console.log('File sent!');
});

router.post('/report/custom', isAdmin, async (req, res) => {
  if ( Object.keys(req.body).length == 0) {
    await req.flash('danger', 'Tiene que seleccionar almenos una columna para el reporte.');
    res.redirect('back');
    return;
  }
  const rows = await ReportController.report(req.body);
  console.log("*************************");
  console.log("****** Report row *******");
  console.log("*************************");
  const filename = `reporte_${req.session.user.id}`;
  fs.writeFileSync(`./public/report/${filename}.json`, JSON.stringify(rows));
  // res.xls('reporte.xlsx', rows);
  // res.send(rows);
  // const workbook = await Convert.jsonArrayToExcel(rows);
  // res.writeHead(200, [
  //   ['Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  //   ["Content-Disposition", "attachment; filename=" + `report.xlsx`]
  // ]);
  // await req.flash('success', `Se inicio el proceso de creacion de reporte. En breve se iniciara la descarga.`);
  // res.redirect('back');
  // setTimeout(async () => {
  //   const filename = `reporte_${req.session.user.id}`;
  //   statusReport[filename] = 0;
  //   const workbook = await Convert.jsonArrayToExcel(rows);
  //   await workbook.xlsx.writeFile(`./public/report/${filename}.xlsx`);
  //   statusReport[filename] = 1;
  // }, 1000)
  // writeReport(rows, filename);
  // console.log(filename);
  // await workbook.xlsx.writeFile(`./public/report/${filename}`);
  // console.log('Reporte creado');
  await req.flash('success', `<script>
      async function downloadFiles() {
        const res = await fetch("/admin/report/pagination/${filename}", {
          "method": "GET"
        });
        const data = await res.json();
        const page = data.page;
        function requestPages(page, maxPage) {
          fetch("/admin/report/excel/${filename}?page=" + page, {
              method: 'GET'
          })
          .then(response => response.blob())
          .then(blob => {
              const a = document.createElement('a');
              a.href = window.URL.createObjectURL(blob);
              a.download = 'reporte_' + page + '/' + maxPage + '.xlsx';
              a.click();
              a.remove();
              if (page + 1 <= maxPage) {
                requestPages(page + 1, maxPage)
              }      
          });
        }
  
        requestPages(1, page);
      };
      downloadFiles();
    </script>Se inicio la descarga del reporte. Si no inicia la descarga dar click <span onclick="downloadFiles()" style="cursor:pointer; display: inline-block; font-weight: bold;">aqui</span><span>.</span>`);
  res.redirect('back');
});

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
