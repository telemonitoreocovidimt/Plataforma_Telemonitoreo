/* eslint "max-len": ["error", {"code":200}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('../config');
const time = require('../lib/time');

/**
 * Validar si existe un paciente vacunado con el número de documento.
 * @param {String} document Número del documento.
 */
async function get(document) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.dt_pacientes_vacuna
                      where documento_identidad = $1 limit 1;`;
    const params = [document];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows[0]);
  });
}

/**
 * Validar si existe un paciente vacunado con el tipo y número de documento.
 * @param {String} document Número del documento.
 * @param {Number} typeDocument Tipo del documento.
 */
async function exist(document, typeDocument) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select *, fecha_respuesta_registro::date fecha_respuesta_registro_date from ${PGSCHEMA}.dt_pacientes_vacuna
                      where documento_identidad = $1 and tipo_documento = $2 limit 1;`;
    const params = [document, typeDocument];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows[0]);
  });
}


/**
 * Validar si existe un paciente vacunado con el número de documento.
 * @param {String} document Número del documento.
 */
async function getCasePatientVaccineForm(document) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = time.getTimeNow();
    const client = await openConnection();
    const query = `select *, cvf.estado estado_caso, cvf.fecha_creacion fecha_creacion_caso from ${PGSCHEMA}.dt_casos_vacuna_form as cvf
                    inner join ${PGSCHEMA}.dt_pacientes_vacuna as pv
                    on cvf.documento_identidad_paciente_vacuna = pv.documento_identidad
                    where cvf.documento_identidad_paciente_vacuna = $1
                    and cvf.fecha_creacion = $2 limit 1;`;
    const params = [document, peruvianDateInit];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows[0]);
  });
}


/**
 * Actualizar datos de paciente vacunado.
 * @param {JSON} data Conjunto de datos para modificar.
 */
async function update(data) {
  return new Promise(async (resolve, reject)=>{
    const {
      documento_identidad: documentoIdentidad,
      tipo_documento: tipoDocumento,
      nombre,
      cargo,
      condicion,
      hospital,
      nota_grupo: notaGrupo,
      estado,
      email,
      celular,
      fecha_creacion: fechaCreacion,
      trabajo_presencial: trabajoPresencial,
      celular_validado: celularValidado,
      fecha_validacion: fechaValidacion,
      puntuacion,
      id_hospital: idHospital,
      fecha_respuesta_registro: fechaRespuestaRegistro,
      fill_document_esavi: fillDocumentESAVI,
      fecha_respuesta_registro_2: fechaRespuestaRegistro2,
    } = data;
    const {peruvianDateCurrent: fechaUltimaModificacion} = time.getTimeNow();
    const client = await openConnection();
    const query = `update ${PGSCHEMA}.dt_pacientes_vacuna set
        tipo_documento = $2,
        nombre = $3,
        cargo = $4,
        condicion = $5,
        hospital = $6,
        nota_grupo = $7,
        estado = $8,
        email = $9,
        celular = $10,
        fecha_creacion = $11,
        trabajo_presencial = $12,
        celular_validado = $13,
        fecha_validacion = $14,
        fecha_ultima_modificacion = $15,
        puntuacion = $16,
        id_hospital = $17,
        fecha_respuesta_registro = $18,
        fill_document_esavi = $19,
        fecha_respuesta_registro_2 = $20
      where documento_identidad = $1;`;
    const params = [
      documentoIdentidad,
      tipoDocumento,
      nombre,
      cargo,
      condicion,
      hospital,
      notaGrupo,
      estado,
      email,
      celular,
      fechaCreacion,
      trabajoPresencial,
      celularValidado,
      fechaValidacion,
      fechaUltimaModificacion,
      puntuacion,
      idHospital,
      fechaRespuestaRegistro,
      fillDocumentESAVI,
      fechaRespuestaRegistro2,
    ];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rowCount);
  });
}

/**
 * Obtener historial de comentarios de un pacientes.
 * @param {String} documentPatient Número del documento de un paciente.
 */
async function getComments(documentPatient) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select comentario, fecha_creacion::text from ${PGSCHEMA}.dt_casos_vacuna
                      where documento_identidad_paciente_vacuna = $1
                      and not comentario is null and not comentario = ''
                      order by fecha_creacion asc;`;
    const params = [documentPatient];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}


/**
 * Crear paciente vacunado.
 * @param {JSON} data Conjunto de datos para nuevo paciente.
 * @return {Promise}
 */
function insert(data) {
  const {
    documento_identidad: numberDocument,
    tipo_documento: typeDocument,
    nombre: name,
    cargo: charger,
    condicion: condition,
    hospital: hospital,
    nota_grupo: noteGroup,
    estado: status,
    email,
    celular: phone,
    fecha_creacion: creationDate,
    celular_validadado: validatedPhone,
    fecha_validacion: validationDate,
    fecha_ultima_modificacion: lastModificationDate,
    puntuacion: score,
    id_hospital: idHospital,
    fecha_respuesta_registro: registerAnswerDate,
  } = data;
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `insert into ${PGSCHEMA}.dt_pacientes_vacuna (
      documento_identidad,
      tipo_documento,
      nombre,
      cargo,
      condicion,
      hospital,
      nota_grupo,
      estado,
      email,
      celular,
      fecha_creacion,
      celular_validado,
      fecha_validacion,
      fecha_ultima_modificacion,
      puntuacion,
      id_hospital,
      fecha_respuesta_registro)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
           $11, $12, $13, $14, $15, $16, $17)`;
    const params = [numberDocument,
      typeDocument,
      name,
      charger,
      condition,
      hospital,
      noteGroup,
      status,
      email,
      phone,
      creationDate,
      validatedPhone,
      validationDate,
      lastModificationDate,
      score,
      idHospital,
      registerAnswerDate];
    try {
      const result = await client.query(query, params);
      client.release(true);
      resolve(result.rowCount);
    } catch (error) {
      resolve(0);
    }
  });
}

module.exports = {
  exist,
  update,
  getCasePatientVaccineForm,
  getComments,
  get,
  insert,
};
