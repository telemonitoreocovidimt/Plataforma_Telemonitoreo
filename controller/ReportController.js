const ReportModel = require('./../model/ReportModel');

module.exports = class ReportController {

    static async report(columns) {
        let columnsPatient = '';
        let columnsCase = '';
        if (columns.hasOwnProperty('p')) {
            columnsPatient += Object.keys(columns['p']).join(', ');
        }
        if (columns.hasOwnProperty('c')) {
            columnsCase += Object.keys(columns['c']).join(', ');
        }
        const result = await ReportModel.report(columnsPatient, columnsCase);
        return result.rows;
    }

}