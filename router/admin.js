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
    let headerMultiColumnRowExcelResumeConcreteBuilder = new HeaderMultiColumnRowExcelResumeConcreteBuilder(fileData, schema.data.sheet, [{ 'start': schema.data.headers.start, 'end': schema.data.headers.end }]);
    let excelResumeDirector = new ExcelResumeDirector(headerMultiColumnRowExcelResumeConcreteBuilder);
    await excelResumeDirector.build();
    const dataResumen = excelResumeDirector.getExcelResume();
    headerMultiColumnRowExcelResumeConcreteBuilder = new HeaderMultiColumnRowExcelResumeConcreteBuilder(fileExclude, schema.exclude.sheet, [{ 'start': schema.exclude.headers.start, 'end': schema.exclude.headers.end }]);
    excelResumeDirector = new ExcelResumeDirector(headerMultiColumnRowExcelResumeConcreteBuilder);
    await excelResumeDirector.build();
    const excludeResumen = excelResumeDirector.getExcelResume();
    if (dataResumen && dataResumen.pages.length > 0 && excludeResumen && excludeResumen.pages.length > 0) {
      const pageData = dataResumen.pages[0];
      const pageExclude = excludeResumen.pages[0];
      let dataFilter = pageData.data.filter((item) => {
        let excluded = false;
        pageExclude.data.forEach((itemExclude) => {
          if (item[schema.data.columnToMatch] == itemExclude[schema.exclude.columnToMatch]) {
            excluded = true;
          }
        });
        return !excluded;
      });
      // Obtener las columnas indicadas
      let rows = dataFilter.map((item) => {
        const row = {};
        Object.keys(schema.as).forEach(function(key) {
            row[key] = item[schema.as[key]]
        });
        return row;
      });
      // console.log(rows);





      if (schema.hasOwnProperty('transform') && typeof(schema.transform) == 'object') {
        rows = rows.map((item) => {
          Object.keys(item).forEach((key) => {
            // console.log("----------------------------------------------------------------");
            // console.log(key);
            // console.log(keyAs);
            // console.log(schema.as[keyAs]);
            if (schema.transform.hasOwnProperty(key)) {


              if (schema.transform[key].hasOwnProperty('mean') && schema.transform[key].mean.length > 0) {
                let value = undefined;
                schema.transform[key].mean.forEach(dupleMean => {
                  if (dupleMean[0] == item[key]) {
                    value = dupleMean[1];
                  }
                });
                item[key] = value;
              }

              if (schema.transform[key].hasOwnProperty('default') && item[key] == undefined) {
                item[key] = schema.transform[key].default;
              }

            } 
          });
          return item;
        });
      }


      if (schema.hasOwnProperty('check') && typeof(schema.check) == 'object') {
        rows = rows.filter((item) => {
          let isValid = true;
          Object.keys(item).forEach((key) => {
            if (schema.check.hasOwnProperty(key) && isValid) {
              if (isValid && schema.check[key].hasOwnProperty('gte')) {
                // console.log("*******************************");
                // console.log(item);
                // console.log(key);
                // console.log("Valor :");
                // console.log(item[key]);
                // console.log(typeof(item[key]));
                // console.log("Restriccion :");
                // console.log(schema.check[key].gte);
                // console.log(typeof(schema.check[key].gte));
                // if (item[key] instanceof Date && !isNaN(Date.parse(schema.check[key].gte))) {
                //   console.log("Value:");
                //   console.log(item[key]);
                //   console.log(item[key].getTime());
                //   console.log("Check:");
                //   console.log(Date.parse(schema.check[key].gte));
                //   console.log(new Date(Date.parse(schema.check[key].gte)));
                //   console.log("Validate:");
                //   console.log(item[key].getTime() >= Date.parse(schema.check[key].gte));
                // }
                
                // console.log(item[key] instanceof Date && 
                //   !isNaN(Date.parse(schema.check[key].gte)) &&
                //   !(item[key].getTime() >= Date.parse(schema.check[key].gte)));
                // console.log(typeof(schema.check[key].gte) == 'number' &&
                // typeof(item[key]) == 'number' &&
                // !(schema.check[key].gte <= item[key]));
                // console.log(schema.check[key].gte instanceof Date);
                // console.log(item[key].getTime());
                // console.log(schema.check[key].gte.getTime());
                // console.log(item[key].getTime() >= schema.check[key].gte.getTime());
                if (item[key] instanceof Date && 
                  !isNaN(Date.parse(schema.check[key].gte)) &&
                  !(item[key].getTime() >= Date.parse(schema.check[key].gte))) {
                    console.log("Update to false!!");
                  isValid = false;
                } else if (
                  typeof(schema.check[key].gte) == 'number' &&
                  typeof(item[key]) == 'number' &&
                  !(schema.check[key].gte <= item[key])) {
                  isValid = false;
                } else if (item[key] == undefined || item[key] == null || item[key] == "") {
                  isValid = false;
                }
              }
              if (isValid && schema.check[key].hasOwnProperty('lte')) {
                if (item[key] instanceof Date &&
                  !isNaN(Date.parse(schema.check[key].lte)) &&
                  !(item[key].getTime() <= schema.check[key].lte.getTime())) {
                  isValid = false;
                } else if (
                  typeof(schema.check[key].lte == 'number') &&
                  typeof(item[key] == 'number') &&
                  !(schema.check[key].lte >= item[key])) {
                  isValid = false;
                } else if (item[key] == undefined || item[key] == null || item[key] == "") {
                  isValid = false;
                }
              }
              if (isValid && schema.check[key].hasOwnProperty('regex')) {
                let re = new RegExp(schema.check[key].regex);
                // console.log(schema.check[key].regex);
                // console.log(item[key]);
                // console.log(re.test(item[key]));
                // console.log(re.test(item[key]));
                // console.log(typeof(re.test(item[key])));
                isValid = re.test(`${item[key]}`);
              }
              if (isValid && schema.check[key].hasOwnProperty('in')) {
                isValid = schema.check[key].in.includes(item[key]);
              }
              if (isValid && schema.check[key].hasOwnProperty('isDate') && schema.check[key].isDate) {
                // console.log("Is date:");
                // console.log(item[key]);
                // console.log(item[key] instanceof Date);
                isValid = item[key] instanceof Date;
              }
              if (isValid && schema.check[key].hasOwnProperty('isRequired') && schema.check[key].isRequired) {
                isValid = !(item[key] == undefined || item[key] == null || item[key] == "");
              }
            } 
          });
          return isValid;
        });
      }

      console.log("Rows");
      console.log(rows);

      // if (schema.hasOwnProperty('check') && typeof(schema.check) == 'object') {
      //   dataFilter = dataFilter.filter((item) => {
      //     let isValid = true;
      //     Object.keys(item).forEach((key) => {
      //       Object.keys(schema.as).map(function (keyAs) {
      //         if (key == schema.as[keyAs] && schema.check.hasOwnProperty(keyAs)) {
      //           if (schema.check[keyAs].hasOwnProperty('gt') && !(schema.check[keyAs].gt < item[key])) {
      //             isValid = false;
      //           }
      //           if (schema.check[keyAs].hasOwnProperty('regex')) {
      //             let re = new RegExp(schema.check[keyAs].regex);
      //             // console.log(schema.check[keyAs].regex);
      //             // console.log(item[key]);
      //             // console.log(re.test(item[key]));
      //             // console.log(re.test(item[key]));
      //             // console.log(typeof(re.test(item[key])));
      //             isValid = re.test(`${item[key]}`);
      //           }
      //         } 
      //       });
      //     });
      //     return isValid;
      //   });
      // }

      // if (schema.hasOwnProperty('transform') && typeof(schema.transform) == 'object') {
      //   dataFilter = dataFilter.map((item) => {
      //     Object.keys(item).forEach((key) => {
      //       Object.keys(schema.as).map(function (keyAs) {
      //         // console.log("----------------------------------------------------------------");
      //         // console.log(key);
      //         // console.log(keyAs);
      //         // console.log(schema.as[keyAs]);
      //         if (key == schema.as[keyAs] && schema.transform.hasOwnProperty(keyAs)) {


      //           if (schema.transform[keyAs].hasOwnProperty('mean') && schema.transform[keyAs].mean.length > 0) {
      //             let value = null;
      //             schema.transform[keyAs].mean.forEach(dupleMean => {
      //               if (dupleMean[0] == item[key]) {
      //                 value = dupleMean[1];
      //               }
      //             });
      //             item[key] = value;
      //           }

      //         } 
      //       });
      //     });
      //     return item;
      //   });
      // }

      // const workbook = Convert.toExcel(dataFilter, schema.as);
      const workbook = Convert.toExcel(rows, schema.as);
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
