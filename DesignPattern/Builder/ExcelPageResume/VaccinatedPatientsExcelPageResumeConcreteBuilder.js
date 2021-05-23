const Ajv = require('ajv');
const ExcelJs = require('exceljs');
const ExcelResumePageBuilder = require('./ExcelPageResumeBuilder.js');
const ExcelResumePage = require('./ExcelPageResume.js');
const ajv = new Ajv();

module.exports = class VaccinatedPatientsExcelPageResumePageConcreteBuilder extends ExcelResumePageBuilder {

    constructor(sheet) {
        super();
        this.sheet = sheet;
        this.headers = [];
        this.rows = [];
        this.data = [];
        const schema = {
            type: 'object',
            properties: {
                'documento_identidad': {
                    'type': 'string',
                },
                'tipo_documento': {
                    'type': 'integer',
                },
                'nombre': {
                    'type': 'string',
                },
                'cargo': {
                    'type': 'string',
                },
                'condicion': {
                    'type': 'string',
                },
                'celular': {
                    'type': 'string',
                },
                'sexo': {
                    'type': 'string',
                },
                'direccion': {
                    'type': 'string',
                },
                'distrito': {
                    'type': 'string',
                },
                'provincia': {
                    'type': 'string',
                },
                'departamento': {
                    'type': 'string',
                },
                'seguro': {
                    'type': 'string',
                },
            },
            required: [
                'documento_identidad',
                'tipo_documento',
                'nombre',
                'cargo',
                'condicion',
                'celular',
                'sexo',
                // 'direccion',
                // 'distrito',
                // 'provincia',
                // 'departamento',
                // 'seguro',
            ],
        };
        this.validate = ajv.compile(schema);
    }

    async buildData () {
        let headers = [];
        const data = [];
        const rows = [];
        this.sheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
            if (rowNumber == 1) {
                headers = row.values;
            } else {
                const rowJson = {};
                row.values.forEach((value, index) => {
                    rowJson[headers[index]] = value;
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
        const validate = this.validate;
        const exceptions = [];
        this.data.forEach((row, index) => {
            row.documento_identidad = '' + row.documento_identidad;
            row.celular = '' + row.celular;
            const valid = validate(row);
            if (!valid) {
                console.log(row);
                console.log(validate.errors);
                console.log('');
                console.log('');
                console.log('');
                validate.errors.forEach((error)=> {
                    console.log(error.instancePath)
                    console.log(error.type);
                    console.log(error.message)
                    exceptions.push(`Error in row ${index}: Column ${error.instancePath.replace('/', '')} ${error.message}`);
                });
            }
        });
        this.excelPageResume.setExceptions(exceptions);
    }

}