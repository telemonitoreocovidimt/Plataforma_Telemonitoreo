const ExcelPageResume = require('./ExcelPageResume.js');

module.exports = class ExcelPageResumeBuilder {

    constructor() {
        this.excelPageResume = new ExcelPageResume();
    }

    buildData () {
    }
    buildRows () {
    }
    buildHeaders () {
    }
    buildSize() {
    }
    buildSheetName () {
    }
    buildExceptions () {
    }

    getExcelPageResume() {
        return this.excelPageResume;
    }

}