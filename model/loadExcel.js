/* eslint max-len: ["error", { "code": 100 }] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');
const {addPatient, updatePatient, getPatientContactByDNI} = require('./patient');

/**
 * Agregar un nuevo paciente
 * @function
 * @param {String} dni Dni de paciente.
 * @param {String} codigo Codigo del paciente.
 * @param {String} nombre Nombre del paciente.
 * @param {String} fechaIngreso Fecha de ingreso del paciente.
 * @param {String} fechaCreacion Fecha de creacion del paciente.
 * @param {String} direccion Dirección del paciente.
 * @param {String} celular Número de celular del paciente.
 * @param {String} fijo Número fijo del paciente.
 * @param {String} idHospital Id de hospitalque monitorea al paciente.
 * @param {Integer} idTipoRegistro Id del tipo de registro.
 * @return {Promise} Devolvera un Boolean que indica si se hizo o no la inserción.
 */
function addPatientAdmission(dni,
    codigo,
    nombre,
    fechaIngreso,
    fechaCreacion,
    direccion,
    celular,
    fijo,
    idHospital, idTipoRegistro=1, jumpInitSurvey=false) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    let query = `SELECT * FROM ${PGSCHEMA}.sp_add_patient_admission($1,$2,$3,$4,$5,$6,$7,$8,$9)`;
    let params = [dni, codigo, fechaIngreso, fechaCreacion,
      nombre, direccion, celular, fijo, idHospital];
    const result = await client.query(query, params);
    query = `update ${PGSCHEMA}.dt_pacientes set
            id_tipo_registro = $1,
            paso_encuesta_inicial = $2
          where dni = $3;`;
    params = [idTipoRegistro, jumpInitSurvey, dni];
    await client.query(query, params);
    client.release(true);
    return resolve(result);
  });
}

/**
 * Agregar un nuevo paciente a tamizaje
 * @function
 * @param {Array} params Parametros necesarios para el procedimiento de tamizaje.
 * @return {Promise} Devolvera un Boolean que indica si se hizo o no la inserción.
 */
function addPatientTamizajeOld(params) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `SELECT * FROM ${PGSCHEMA}.sp_add_patient_tamizaje($1,$2,$3,$4,$5,$6,$7,
        $8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`;
    const result = await client.query(query, params);
    console.log(params);
    client.release(true);
    return resolve(result);
  });
}

/**
 * Agregar o actualizar un paciente por tamizaje
 * @function
 * @param {Array} params Parametros necesarios para el procedimiento de tamizaje.
 * @return {Promise} Devolvera un Boolean que indica si se hizo correctamente el proceso.
 */
function addPatientTamizaje(params) {
  return new Promise(async (resolve, reject)=>{
    const {documento} = params;
    const patient = await getPatientContactByDNI(documento);
    // console.log(params);
    // resolve();
    params.estado = 1;
    if ((params.resultadoMuestra1 == null &&
      params.fechaResultado1 == null &&
      params.tipoMuestra1 == null) &&
    (params.resultadoMuestra1 == null &&
      params.fechaResultado1 == null &&
      params.tipoMuestra1 == null) &&
    (params.resultadoMuestra1 == null &&
      params.fechaResultado1 == null &&
      params.tipoMuestra1 == null)) {
      params.grupo = 'C';
    } else if (params.resultadoMuestra1 == 2 ||
      params.resultadoMuestra2 == 2||
      params.resultadoMuestra3 == 2) {
      params.grupo = 'A';
    } else {
      params.grupo = 'B';
    }
    if (patient != null) {
      // console.log('Resultado prueba 1 : ', resultadoMuestra(row.resultadoMuestra1));
      // console.log('Resultado prueba 2 : ', resultadoMuestra(row.resultadoMuestra2));
      // console.log('Resultado prueba 3 : ', resultadoMuestra(row.resultadoMuestra3));
      if (patient.estado == 4) {
        params.estado = 2;
      } else {
        params.estado = patient.estado;
      }
      // console.log(params);
      await updatePatient(params);
    } else {
      params.factorRiesgo = null;
      params.pasoEncuestaInicial = false;
      params.flagActivo = true;
      // console.log(params);
      await addPatient(params);
    }
    resolve(true);
  });
}

/**
 * Agregar resgistro al historico del paciente
 * @function
 * @param {String} dni DNI del paciente
 * @param {String} destino Destino del paciente
 * @param {String} lugarDestino Lugar de destino del paciente
 * @param {String} clasificacion Clasificación de estado del paciente
 * @param {String} evolucion Detalle de evolución del paciente.
 * @return {Promise}
 */
function addHistory(dni, destino, lugarDestino, clasificacion, evolucion) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `insert into ${PGSCHEMA}.dt_historial (dni_paciente, destino, lugar_destino,
            clasificación, evolucion) values($1,$2,$3,$4,$5)`;
    const params = [dni, destino, lugarDestino, clasificacion, evolucion];
    const result = await client.query(query, params);
    client.release(true);
    return resolve(result);
  });
}

module.exports = {
  addPatientAdmission,
  addPatientTamizaje,
  addHistory,
};
