const ExcelResumeDirector = require('./DesignPattern/Builder/ExcelResume/ExcelResumeDirector');
const HeaderMultiColumnRowExcelResumeConcreteBuilder = require('./DesignPattern/Builder/ExcelResume/HeaderMultiColumnRowExcelResumeConcreteBuilder');
const fs = require('fs');

async function readExcel() {
    const data = fs.readFileSync('Documentos para carga - Plataforma.xlsx');
    const headers = [
        {
            start: 1,
            end: 1,
        },
        {
            start: 2,
            end: 4,
        }
    ];
    const headerMultiColumnRowExcelResumeConcreteBuilder = new HeaderMultiColumnRowExcelResumeConcreteBuilder(data, headers);
    const excelResumeDirector = new ExcelResumeDirector(headerMultiColumnRowExcelResumeConcreteBuilder);
    await excelResumeDirector.build();
    // console.log(excelResumeDirector.getExcelResume())
    console.log(excelResumeDirector.getExcelResume().pages[0].headers)
    console.log(excelResumeDirector.getExcelResume().pages[1].headers)
    // console.log(excelResumeDirector.getExcelResume().pages[0].data)
}

readExcel();