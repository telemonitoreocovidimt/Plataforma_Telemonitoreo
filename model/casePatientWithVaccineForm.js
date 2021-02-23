/* eslint "max-len": ["error", {"code":200}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('../config');
const time = require('./../lib/time');

/**
 * Validar si existe un paciente vacunado con el número de documento.
 * @param {JSON} data Número del documento.
 */
async function updateCasePatientWithVaccineForm(data) {
  return new Promise(async (resolve, reject)=>{
    const {
      id,
      documento_identidad_paciente_vacuna: documentoIdentidadPacienteVacuna,
      fecha_creacion: fechaCreacion,
      dolor,
      fiebre,
      fatiga,
      cabeza,
      confusion,
      adormecimiento,
      diarrea,
      otros,
      fecha_respondido: fechaRespondido,
      estado,
      puntuacion,
      piel,
    } = data;
    const client = await openConnection();
    const query = `update ${PGSCHEMA}.dt_casos_vacuna_form set
                        documento_identidad_paciente_vacuna = $2,
                        fecha_creacion = $3,
                        dolor = $4,
                        fiebre = $5,
                        fatiga = $6,
                        cabeza = $7,
                        confusion = $8,
                        adormecimiento = $9,
                        diarrea = $10,
                        otros = $11,
                        fecha_respondido = $12,
                        estado = $13,
                        puntuacion = $14,
                        piel = $15
                    where id = $1;`;
    const params = [id,
      documentoIdentidadPacienteVacuna,
      fechaCreacion,
      dolor,
      fiebre,
      fatiga,
      cabeza,
      confusion,
      adormecimiento,
      diarrea,
      otros,
      fechaRespondido,
      estado,
      puntuacion,
      piel];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rowCount);
  });
};

/**
 * Validar si existe un paciente vacunado con el número de documento.
 * @return {Promise}
 */
async function getCasePatientWithVaccineFormPending() {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = time.getTimeNow();
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.dt_casos_vacuna_form as cv
                    inner join ${PGSCHEMA}.dt_pacientes_vacuna as pv
                    on cv.documento_identidad_paciente_vacuna = pv.documento_identidad
                    where cv.fecha_creacion = $1
                    and cv.estado = 1;`;
    const params = [peruvianDateInit];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
};

/**
 * Validar si existe un paciente vacunado con el número de documento.
 * @param {String} document Número del documento.
 */
async function getByCurrentDayAndNumberDocument(document) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = time.getTimeNow();
    const client = await openConnection();
    const query = `select *, cvf.estado estado_caso, cvf.fecha_creacion fecha_creacion_caso from ${PGSCHEMA}.dt_casos_vacuna_form as cvf
                    inner join ${PGSCHEMA}.dt_pacientes_vacuna as pv
                    on cvf.documento_identidad_paciente_vacuna = pv.documento_identidad
                    where cvf.documento_identidad_paciente_vacuna = $1
                    and cvf.fecha_creacion::date = $2::date order by id desc limit 1;`;
    const params = [document, peruvianDateInit];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows[0]);
  });
}

module.exports = {
  updateCasePatientWithVaccineForm,
  getCasePatientWithVaccineFormPending,
  getByCurrentDayAndNumberDocument,
};
