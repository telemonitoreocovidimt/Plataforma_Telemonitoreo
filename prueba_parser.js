const json2xls = require('json2xls');
const fs = require('fs');
const Convert = require('./util/convert');
(async function () {
    const reporte = fs.readFileSync('./public/report/reporte_1.json', 'utf8');
    console.log('Reporte');
    const workbook = await Convert.jsonArrayToExcel(JSON.parse(reporte));
    console.log('workbook');
    const buffer = await workbook.xlsx.writeBuffer();
    fs.readFileSync('./public/report/reporte_1.xlsx', buffer);
    // workbook.xlsx.writeFile(`./public/report/reporte_1.xlsx`);
})();
// fs.writeFileSync('data.xlsx', xls, 'binary');