const ExcelJs = require('exceljs');

module.exports = class ExcelPageResume {

    constructor() {
        this.pages = [];
        this.name = null;
        this.size = 0;
        this.exceptions = [];
    }
        
    setPages(pages) {
        this.pages = pages;
    }
    setSize(size) {
        this.size = size;
    }
    setExceptions(exceptions) {
        this.exceptions = exceptions;
    }
    setName(name) {
        this.name = name;
    }

    getPages() {
        return this.pages;
    }
    getSize() {
        return this.size;
    }
    getExceptions() {
        return this.exceptions;
    }
    getName() {
        return this.name;
    }
}