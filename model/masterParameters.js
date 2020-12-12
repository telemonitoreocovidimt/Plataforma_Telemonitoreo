/* eslint 'max-len': ['error', {'code':250}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');

/**
 * Obtener un parametro maestro segun el ID de hospital
 * @function
 * @param {Number} group Número de grupo de parametros.
 * @param {Number} idHospital Id de hospital.
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function getMasterParameterHospital(group, idHospital, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select descripcion from  ${PGSCHEMA}.dm_parametros_maestros_hospital 
                where grupo_parametro = $1 and id_hospital= $2;`;
    const params = [group, idHospital];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rows, client});
  });
}

module.exports = {
  getMasterParameterHospital,
};
