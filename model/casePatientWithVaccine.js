/* eslint "max-len": ["error", {"code":200}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('../config');
const time = require('./../lib/time');
const enums = require('./../res/enum');

/**
 * Obtener caso de un paciente por el ID de caso.
 * @param {String} idCase Id del caso.
 * @return {Promise}
 */
async function existToDay(idCase) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = time.getTimeNow();
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.dt_casos_vacuna
                        where id = $1 and fecha_creacion = $2;`;
    const params = [idCase, peruvianDateInit];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows[0]);
  });
};

/**
 * Obtener caso de un paciente por el número de documento.
 * @param {String} numberDocument Documento de identidad del paciente.
 * @return {Promise}
 */
async function getByCurrentDayAndNumberDocument(numberDocument) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = time.getTimeNow();
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.dt_casos_vacuna
                        where documento_identidad_paciente_vacuna = $1
                        and fecha_creacion::date = $2::date order by id desc limit 1;`;
    const params = [numberDocument, peruvianDateInit];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows[0]);
  });
};

/**
 * Actualizar caso de vacuna.
 * @param {JSON} data Datos nuevos.
 * @return {Promise}
 */
async function update(data) {
  return new Promise(async (resolve, reject)=>{
    const {
      id,
      documento_identidad_paciente_vacuna: numberDocument,
      fecha_creacion: fechaCreacion,
      comentario: comment,
      estado: status,
      fecha_tomado: dateTaken,
      fecha_cierre: dateClose,
      dni_medico: dniMedico,
    } = data;
    const client = await openConnection();
    const query = `update ${PGSCHEMA}.dt_casos_vacuna set
                      documento_identidad_paciente_vacuna = $2,
                      fecha_creacion = $3,
                      comentario = $4,
                      estado = $5,
                      fecha_tomado = $6,
                      fecha_cierre = $7,
                      dni_medico = $8
                  where id = $1`;
    const params = [id,
      numberDocument,
      fechaCreacion,
      comment,
      status,
      dateTaken,
      dateClose,
      dniMedico];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rowCount);
  });
};

/**
 * Cerrar caso de paciente con vacuna.
 * @param {String} id id de caso.
 * @return {Promise}
 */
async function closeBySystem(id) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `update ${PGSCHEMA}.dt_casos_vacuna set
                    estado = $2
                  where id = $1`;
    const params = [id, enums.STATUS_CASE.CLOSED_SYSTEM];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rowCount);
  });
};

module.exports = {
  existToDay,
  update,
  getByCurrentDayAndNumberDocument,
  closeBySystem: closeBySystem,
};
