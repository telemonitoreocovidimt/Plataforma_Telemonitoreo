const {openConnection} = require('./connection');
const {PGSCHEMA} = require('../config');
const Parser = require('./../lib/parser');

module.exports = class CaseModel {



    /**
     * Actualizar caso
     * @param {Number} caseId id del caso que se actualizara
     * @param {JSON} data campo para actualizar
     * @return {Number} Cantidad de registros afectados.
     */
    static async update(caseId, data) {
        return new Promise(async (resolve, reject)=>{
            const client = await openConnection();
            const q = `update ${PGSCHEMA}.dt_casos_dia set
                        ${Parser.toSQLParameters(data)}
                        where id = $1;`;
            const params = [caseId];
            const result = await client.query(q, params);
            client.release(true);
            console.log("Update Case");
            console.log(result);
            resolve(result.rowCount);
        });
    }
    

}