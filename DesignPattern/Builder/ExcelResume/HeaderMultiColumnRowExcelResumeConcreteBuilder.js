const ExcelJs = require('exceljs');
const ExcelPageResumeListBuilder = require('./ExcelResumeBuilder.js');
const ExcelPageResumeDirector = require('../ExcelPageResume/ExcelPageResumeDirector.js');
const HeaderMultiColumnRowExcelPageResumeConcreteBuilder = require('../ExcelPageResume/HeaderMultiColumnRowExcelPageResumeConcreteBuilder.js');

module.exports = class HeaderMultiColumnRowExcelResumeConcreteBuilder extends ExcelPageResumeListBuilder {

    constructor(data, sheet, headerConfigList) {
        super();
        this.workBook = new ExcelJs.Workbook();
        this.data = data;
        this.sheet = sheet;
        this.headerConfigList = headerConfigList;
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
        const _this = this;
        await Promise.all(this.workBook.worksheets.map(async (sheet, index)=>{
            console.log("------------------");
            console.log("Sheet name: " + sheet.name);
            console.log("Wanted sheet: " + this.sheet);
            console.log("------------------");
            // if (sheet.name == this.sheet) {
            if ((typeof(this.sheet) == 'string' && sheet.name == this.sheet) || (typeof(this.sheet) == 'number' && this.sheet == index + 1) || (typeof(this.sheet) == 'number' && this.sheet == -1 && index + 1 == this.workBook.worksheets.length)) {
                console.log('Sheet!!');
                const startHeader = _this.headerConfigList[0] && _this.headerConfigList[0].start ? _this.headerConfigList[0].start : 1;
                const endHeader = _this.headerConfigList[0] && _this.headerConfigList[0].end ? _this.headerConfigList[0].end : 1;
                console.log(startHeader);
                console.log(endHeader);
                const headerMultiColumnRowExcelPageResumeConcreteBuilder = new HeaderMultiColumnRowExcelPageResumeConcreteBuilder(sheet, startHeader, endHeader);
                const excelPageResumeDirector = new ExcelPageResumeDirector(headerMultiColumnRowExcelPageResumeConcreteBuilder);
                await excelPageResumeDirector.build();
                pages.push(excelPageResumeDirector.getExcelPageResume());   
            }
        }));
        // const headerMultiColumnRowExcelPageResumeConcreteBuilder = new HeaderMultiColumnRowExcelPageResumeConcreteBuilder(this.workBook.worksheets[0]);
        // const excelPageResumeDirector = new ExcelPageResumeDirector(headerMultiColumnRowExcelPageResumeConcreteBuilder);
        // await excelPageResumeDirector.build();
        // pages.push(excelPageResumeDirector.getExcelPageResume());
        // const headerMultiColumnRowExcelPageResumeConcreteBuilder = new HeaderMultiColumnRowExcelPageResumeConcreteBuilder(this.workBook.worksheets[1], 1, 4);
        // const excelPageResumeDirector = new ExcelPageResumeDirector(headerMultiColumnRowExcelPageResumeConcreteBuilder);
        // await excelPageResumeDirector.build();
        // pages.push(excelPageResumeDirector.getExcelPageResume());
        this.excelResume.setPages(pages);
    }

    buildName() {
        this.excelResume.setName(null);
    }
    buildExceptions() {
        this.excelResume.setExceptions([]);
    }

}