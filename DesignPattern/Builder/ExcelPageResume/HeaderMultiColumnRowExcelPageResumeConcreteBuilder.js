const Ajv = require('ajv');
const ExcelJs = require('exceljs');
const ExcelResumePageBuilder = require('./ExcelPageResumeBuilder.js');
const ExcelResumePage = require('./ExcelPageResume.js');
const ajv = new Ajv();

module.exports = class HeaderMultiColumnRowExcelPageResumeConcreteBuilder extends ExcelResumePageBuilder {

    constructor(sheet, startHeader = 1, endHeader = 1) {
        super();
        this.startHeader = startHeader;
        this.endHeader = endHeader;
        this.sheet = sheet;
        this.headers = [];
        this.rows = [];
        this.data = [];
    }

    async buildData () {
        let headers = [];
        const data = [];
        const rows = [];
        const _this = this;
        let lastRow = [];
        this.sheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
            if (rowNumber >= _this.startHeader && rowNumber <= _this.endHeader) {
                if (headers.length === 0) {
                    headers = row.values;
                    lastRow = row.values;
                } else {
                    row.values.forEach((value, index) => {
                        if (index && lastRow[index] != value) {
                            headers[index] = `${headers[index]} ${value}`;
                        }
                    });
                    lastRow = row.values;
                }
            } else if (rowNumber > _this.endHeader) {
                const rowJson = {};
                row.values.forEach((value, index) => {
                    if (typeof value === 'object' && (value.hasOwnProperty('formula') || value.hasOwnProperty('result'))) {
                        if (value.hasOwnProperty('result') && value.result.hasOwnProperty('error')) {
                            rowJson[headers[index]] = value.result.error;
                        }
                        else if (value.hasOwnProperty('result')) {
                            rowJson[headers[index]] = value.result
                        }
                        else {
                            rowJson[headers[index]] = null;
                        }
                    } else {
                        rowJson[headers[index]] = value;
                    }
                });
                data.push(rowJson)
                rows.push(row);
            }
        });
        this.excelPageResume.setData(data);
        this.headers = headers;
        this.rows = rows;
        this.data = data;
    }
    buildRows () {
        this.excelPageResume.setRows(this.rows);
    }
    buildHeaders () {
        this.excelPageResume.setHeaders(this.headers);
    }
    buildSize() {
        this.excelPageResume.setSize(this.data.length);
    }
    buildSheetName() {
        this.excelPageResume.setSheetName(this.sheet.name);
    }
    buildExceptions () {
    }

}