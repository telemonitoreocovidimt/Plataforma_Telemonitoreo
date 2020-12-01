const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');

/**
 * Validar si un paciente acepto los terminos y condiciones
 * @function
 * @param {Number} dni Número de documento
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function validateTerm(dni, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select acepto_terminos from ${PGSCHEMA}.dt_pacientes
        where dni = $1;`;
    const params = [dni];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rows, client});
  });
}

/**
 * Obtener los datos de un usuario por DNI
 * @function
 * @param {Number} dni Número de documento
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function getInfoPatient(dni, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select * from ${PGSCHEMA}.dt_pacientes
        where dni = $1;`;
    const params = [dni];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rows, client});
  });
}

/**
 * Actualizar terminos de un paciente
 * @function
 * @param {Number} dni Número de documento
 * @param {Boolean} acceptedTemrs Acepto o no los terminos
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function updateTermsPatient(dni, acceptedTemrs, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_pacientes set
            acepto_terminos = $2
            where dni = $1;`;
    const params = [dni, acceptedTemrs];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'updated': result.rowCount? true : false, client});
  });
}


module.exports = {
  validateTerm,
  getInfoPatient,
  updateTermsPatient,
};
