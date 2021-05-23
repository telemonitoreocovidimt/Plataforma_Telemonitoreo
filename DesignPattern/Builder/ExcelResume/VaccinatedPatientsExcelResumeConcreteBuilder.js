const ExcelJs = require('exceljs');
const ExcelPageResumeListBuilder = require('./ExcelResumeBuilder.js');
const ExcelPageResumeDirector = require('../ExcelPageResume/ExcelPageResumeDirector.js');
const VaccinatedPatientsExcelPageResumeConcreteBuilder = require('../ExcelPageResume/VaccinatedPatientsExcelPageResumeConcreteBuilder.js');

module.exports = class VaccinatedPatientsExcelPageResumeListPageConcreteBuilder extends ExcelPageResumeListBuilder {

    constructor(data) {
        super();
        this.workBook = new ExcelJs.Workbook();
        this.data = data;
    }

    buildSize() {
        this.excelResume.setSize(this.workBook.worksheets.length);
    }

    async buildPages() {
        if (Buffer.isBuffer(this.data)) {
            await this.workBook.xlsx.load(this.data);
        } else if (typeof(this.data) == String) {
            await this.workBook.xlsx.readFile(this.data);
        }   else {
            await this.workBook.xlsx.read(this.data);
        } 
        const pages = [];
        await Promise.all(this.workBook.worksheets.map(async (sheet)=>{
            const vaccinatedPatientsExcelPageResumeConcreteBuilder = new VaccinatedPatientsExcelPageResumeConcreteBuilder(sheet);
            const excelPageResumeDirector = new ExcelPageResumeDirector(vaccinatedPatientsExcelPageResumeConcreteBuilder);
            await excelPageResumeDirector.build();
            pages.push(excelPageResumeDirector.getExcelPageResume());
        }));
        this.excelResume.setPages(pages);
    }

    buildName() {
        this.excelResume.setName(null);
    }
    buildExceptions() {
        this.excelResume.setExceptions([]);
    }

}