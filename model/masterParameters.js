/* eslint 'max-len': ['error', {'code':250}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');

/**
 * Obtener un parametro maestro segun el ID de hospital
 * @function
 * @param {Number} group Número de grupo de parametros.
 * @param {Number} idHospital Id de hospital.
 * @return {Promise}
 */
function get(group, idHospital) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select descripcion from  ${PGSCHEMA}.dm_parametros_maestros_hospital 
                where grupo_parametro = $1 and id_hospital= $2 limit 1;`;
    const params = [group, idHospital];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows[0]);
  });
}

module.exports = {
  get,
};
