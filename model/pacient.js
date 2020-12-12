/* eslint 'max-len': ['error', {'code':250}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');

/**
 * Modificar el tipo de documento de un paciente.
 * @function
 * @param {Number} typeDocument Tipo de documento del paciente.
 * @param {String} dniPatient Dni del paciente.
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function setTypeDocument(typeDocument, dniPatient, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_pacientes
            set tipo_documento = $1
            where dni =$2`;
    const params = [typeDocument, dniPatient];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rowCount, client});
  });
}

/**
 * Modificar el nombre de un paciente.
 * @function
 * @param {String} namePatient Nombre del paciente.
 * @param {String} dniPatient Dni del paciente.
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function setName(namePatient, dniPatient, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_pacientes
            set nombre = $1
            where dni =$2`;
    const params = [namePatient, dniPatient];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rowCount, client});
  });
}

/**
 * Modificar edad de paciente.
 * @function
 * @param {Number} agePatient Edad del paciente.
 * @param {String} dniPatient Dni del paciente.
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function setAge(agePatient, dniPatient, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_pacientes
            set edad = $1
            where dni =$2`;
    const params = [agePatient, dniPatient];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rowCount, client});
  });
}

module.exports = {
  setTypeDocument,
  setName,
  setAge,
};
