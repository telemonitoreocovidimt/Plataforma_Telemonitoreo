
/* eslint 'max-len': ['error', {'code':250}] */
const {executeSelect} = require('./connection');
const {PGSCHEMA} = require('../config');


module.exports = class ParameterModel {

    static async getParameter(parameters) {
        const query = `
            select ${parameters.join(', ')} from ${PGSCHEMA}.dm_parametros;
        `;
        const result = await executeSelect(query, []);
        return result;
    }

    static async setParameter(parameter, value) {
        const query = `
            update ${PGSCHEMA}.dm_parametros set
                ${parameter} = $1;
        `;
        const result = await executeSelect(query, [value]);
        return result;
    }
    
}