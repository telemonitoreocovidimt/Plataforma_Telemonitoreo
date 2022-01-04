/* eslint 'max-len': ['error', {'code':250}] */
const {executeSelect} = require('./connection');
const {PGSCHEMA} = require('../config');

module.exports = class ReportModel {

    static async report(columnsPatient, columnsCase) {
        // console.log(columnsPatient);
        // console.log(columnsCase);
        let query = `
            select ${columnsPatient} from ${PGSCHEMA}.dt_pacientes as p
        `;
        if (columnsCase.length > 0) {
            query = `
                select ${[columnsPatient, columnsCase].join(', ')} from ${PGSCHEMA}.dt_pacientes as p
                left join ${PGSCHEMA}.dt_casos_dia as c
                on p.dni = c.dni_paciente
            `;
        }
        // console.log(query);
        const result = await executeSelect(query, []);
        return result;
    }

}