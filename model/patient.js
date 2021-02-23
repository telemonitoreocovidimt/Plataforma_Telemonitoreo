/* eslint 'max-len': ['error', {'code':250}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');

/**
 * Buscar información de un paciente por el DNI, si es null no existe el paciente.
 * @param {String} dni Número de Dni del pacietne que deseas ubicar.
 * @return {JSON} Json con los datos del paciente.
 */
function getPatientContactByDNI(dni) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.dt_pacientes where dni = $1`;
    const params = [dni];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows.length > 0? result.rows[0] : null);
  });
}

/**
 * Buscar información de un paciente por el DNI, si es null no existe el paciente.
 * @param {String} numberDocument Número de Dni del pacietne que deseas ubicar.
 * @return {Promise}
 */
function exist(numberDocument) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.dt_pacientes where dni = $1 limit 1`;
    const params = [numberDocument];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows[0]);
  });
}

/**
 * Actualizar datos de un paciente
 * @function
 * @param {JSON} params Json con todos los datos para actualizar al paciente.
 * @return {Boolean} Success del Update.
 */
async function updatePatient(params) {
  const {
    documento,
    numero,
    fecha,
    fechaCreacion,
    nombre,
    direccion,
    celular,
    fijo,
    estado,
    grupo,
    sexo,
    pais,
    provincia,
    distrito,
    fechaSintomas,
    resultadoMuestra1,
    fechaResultado1,
    tipoMuestra1,
    resultadoMuestra2,
    fechaResultado2,
    tipoMuestra2,
    resultadoMuestra3,
    fechaResultado3,
    tipoMuestra3,
    fechaMuestra,
    idHospital,
  } = params;
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `update ${PGSCHEMA}.dt_pacientes set 
                      codigo = $2,
                      fecha_ingreso = $3,
                      fecha_ultima_actualizacion = $4,
                      cantidad_subidas = cantidad_subidas + 1,
                      nombre = $5,
                      direccion = $6,
                      celular = $7,
                      fijo = $8,
                      estado = $9,
                      grupo = $10,
                      sexo = $11,
                      pais = $12,
                      provincia = $13,
                      distrito = $14,
                      fecha_inicio_sintomas = $15,
                      resultado_prueba_1 = $16,
                      fecha_resultado_prueba_1 = $17,
                      tipo_prueba_1 = $18,
                      resultado_prueba_2 = $19,
                      fecha_resultado_prueba_2 = $20,
                      tipo_prueba_2 = $21,
                      resultado_prueba_3 = $22,
                      fecha_resultado_prueba_3 = $23,
                      tipo_prueba_3 = $24,
                      fecha_prueba = $25,
                      id_hospital = $26
                      where dni = $1;`;
    const params = [documento,
      numero,
      fecha,
      fechaCreacion,
      nombre,
      direccion,
      celular,
      fijo,
      estado,
      grupo,
      sexo,
      pais,
      provincia,
      distrito,
      fechaSintomas,
      resultadoMuestra1,
      fechaResultado1,
      tipoMuestra1,
      resultadoMuestra2,
      fechaResultado2,
      tipoMuestra2,
      resultadoMuestra3,
      fechaResultado3,
      tipoMuestra3,
      fechaMuestra,
      idHospital];
    // console.log('______******______');
    // console.log(query);
    // console.log(params);
    await client.query(query, params);
    client.release(true);
    resolve(true);
  });
}

/**
 * Actualizar datos de un paciente
 * @function
 * @param {JSON} params Json con todos los datos para el paciente nuevo.
 * @return {Boolean} Success del Insert.
 */
async function addPatient(params) {
  const {
    documento,
    numero,
    fecha,
    fechaCreacion,
    nombre,
    direccion,
    celular,
    fijo,
    estado,
    grupo,
    factorRiesgo,
    pasoEncuestaInicial,
    flagActivo,
    sexo,
    pais,
    provincia,
    distrito,
    fechaSintomas,
    resultadoMuestra1,
    fechaResultado1,
    tipoMuestra1,
    resultadoMuestra2,
    fechaResultado2,
    tipoMuestra2,
    resultadoMuestra3,
    fechaResultado3,
    tipoMuestra3,
    fechaMuestra,
    idHospital,
  } = params;
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `insert into ${PGSCHEMA}.dt_pacientes (
        dni, codigo, fecha_ingreso, fecha_ultima_actualizacion, fecha_creacion, nombre, direccion, celular, fijo, estado, grupo, 
        factor_riesgo, paso_encuesta_inicial, flag_activo, sexo, pais, provincia, distrito, fecha_inicio_sintomas,
        resultado_prueba_1, fecha_resultado_prueba_1, tipo_prueba_1, resultado_prueba_2, 
        fecha_resultado_prueba_2, tipo_prueba_2, resultado_prueba_3, fecha_resultado_prueba_3, tipo_prueba_3, fecha_prueba, id_hospital) 
    values(
        $1, $2, $3, $4, $4, $5, $6, $7, $8, $9, $10, 
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 
        $23, $24, $25, $26, $27, $28, $29);`;
    const params = [documento,
      numero,
      fecha,
      fechaCreacion,
      nombre,
      direccion,
      celular,
      fijo,
      estado,
      grupo,
      factorRiesgo,
      pasoEncuestaInicial,
      flagActivo,
      sexo,
      pais,
      provincia,
      distrito,
      fechaSintomas,
      resultadoMuestra1,
      fechaResultado1,
      tipoMuestra1,
      resultadoMuestra2,
      fechaResultado2,
      tipoMuestra2,
      resultadoMuestra3,
      fechaResultado3,
      tipoMuestra3,
      fechaMuestra,
      idHospital];
    await client.query(query, params);
    client.release(true);
    resolve(true);
  });
}

module.exports = {
  updatePatient,
  getPatientContactByDNI,
  addPatient,
  exist,
};
