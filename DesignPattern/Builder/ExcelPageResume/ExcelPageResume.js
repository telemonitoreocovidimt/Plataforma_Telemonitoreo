const ExcelJs = require('exceljs');

module.exports = class ExcelPageResume {

    constructor() {
        this.data = [];
        this.rows = [];
        this.headers = [];
        this.size = 0;
        this.exceptions = [];
        this.sheetName = null;
    }
        
    setData(data) {
        this.data = data;
    }
    setRows(rows) {
        this.rows = rows;
    }
    setHeaders(headers) {
        this.headers = headers;
    }
    setSize(size) {
        this.size = size;
    }
    setExceptions(exceptions) {
        this.exceptions = exceptions;
    }
    setSheetName(sheetName) {
        this.sheetName = sheetName;
    }

    getData() {
        return this.data;
    }
    getRows() {
        return this.rows;
    }
    getHeaders() {
        return this.headers;
    }
    getSize() {
        return this.size;
    }
    getExceptions() {
        return this.exceptions;
    }
    getSheetName() {
        return this.sheetName;
    }
}