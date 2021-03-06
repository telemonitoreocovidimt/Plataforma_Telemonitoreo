const ExcelJs = require('exceljs');
const ExcelPageResumeListBuilder = require('./ExcelResumeBuilder.js');
const ExcelPageResumeDirector = require('../ExcelPageResume/ExcelPageResumeDirector.js');
const HeaderMultiColumnRowExcelPageResumeConcreteBuilder = require('../ExcelPageResume/HeaderMultiColumnRowExcelPageResumeConcreteBuilder.js');

module.exports = class HeaderMultiColumnRowExcelResumeConcreteBuilder extends ExcelPageResumeListBuilder {

    constructor(data, headerConfigList) {
        super();
        this.workBook = new ExcelJs.Workbook();
        this.data = data;
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
            const startHeader = _this.headerConfigList[index] && _this.headerConfigList[index].start ? _this.headerConfigList[index].start : 1;
            const endHeader = _this.headerConfigList[index] && _this.headerConfigList[index].end ? _this.headerConfigList[index].end : 1;
            const headerMultiColumnRowExcelPageResumeConcreteBuilder = new HeaderMultiColumnRowExcelPageResumeConcreteBuilder(sheet, startHeader, endHeader);
            const excelPageResumeDirector = new ExcelPageResumeDirector(headerMultiColumnRowExcelPageResumeConcreteBuilder);
            await excelPageResumeDirector.build();
            pages.push(excelPageResumeDirector.getExcelPageResume());
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