const ReportModel = require('./../model/ReportModel');

module.exports = class ReportController {

    static async report(columns, from, to) {
        let columnsPatient = '';
        let columnsCase = '';
        if (columns.hasOwnProperty('p')) {
            columnsPatient += Object.keys(columns['p']).join(', ');
        }
        if (columns.hasOwnProperty('c')) {
            columnsCase += Object.keys(columns['c']).join(', ');
        }
        const result = await ReportModel.report(columnsPatient, columnsCase, from, to);
        return result.rows;
    }

}