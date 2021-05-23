const ExcelResume = require('./ExcelResume');

module.exports = class ExcelPageResumeListBuilder {

    constructor() {
        this.excelResume = new ExcelResume();
    }

    buildAmount() {
    }
    buildPages() {
    }
    buildSize() {

    }
    buildName() {

    }
    buildExceptions() {

    }

    getExcelResume() {
        return this.excelResume;
    }

}