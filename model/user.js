const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');
const {getTimeNow} = require('./../lib/time');

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
 * @param {Boolean} acceptedTermData Acepto o no los terminos para uso de datos.
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function updateTermsPatient(dni, acceptedTemrs, acceptedTermData, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateCurrent} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_pacientes set
            acepto_terminos = $2,
            acepto_terminos_datos = $3,
            fecha_respuesta_terminos = $4
            where dni = $1;`;
    const params = [dni, acceptedTemrs, acceptedTermData, peruvianDateCurrent];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'updated': result.rowCount? true : false, client});
  });
}


/**
 * Actualizar datos de un paciente
 * @function
 * @param {Number} dni Número de documento del paciente
 * @param {Object} body Body de parametros
 * @return {Promise}
 */
function updatePatient(dni, body) {
  const {
    direccion,
    pais,
    provincia,
    distrito,
    edad,
    factor,
  } = body;
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `update ${PGSCHEMA}.dt_pacientes set
            direccion = $2,
            pais = $3,
            provincia = $4,
            distrito = $5,
            edad = $6,
            factor_riesgo = $7
            where dni = $1;`;
    const params = [dni, direccion, pais, provincia, distrito, edad, factor];
    const result = await client.query(query, params);
    client.release(true);
    resolve({'updated': result.rowCount? true : false, client});
  });
}


module.exports = {
  validateTerm,
  getInfoPatient,
  updateTermsPatient,
  updatePatient,
};
