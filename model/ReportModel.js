/* eslint 'max-len': ['error', {'code':250}] */
const {executeSelect} = require('./connection');
const {PGSCHEMA} = require('../config');

module.exports = class ReportModel {

    static async report(columnsPatient, columnsCase, from, to) {
        // console.log(columnsPatient);
        // console.log(columnsCase);
        console.log("To:");
        console.log(to);
        console.log('From:');
        console.log(from);
        let query = `
            select ${columnsPatient} from ${PGSCHEMA}.dt_pacientes as p where p.fecha_creacion >= $1 and p.fecha_creacion <= $2
        `;
        if (columnsCase.length > 0) {
            query = `
                select ${[columnsPatient, columnsCase].join(', ')} from ${PGSCHEMA}.dt_pacientes as p
                left join ${PGSCHEMA}.dt_casos_dia as c
                on p.dni = c.dni_paciente
                where c.fecha_caso >= $1 and c.fecha_caso <= $2
            `;
        }
        // console.log(query);
        const result = await executeSelect(query, [from, to]);
        return result;
    }

}