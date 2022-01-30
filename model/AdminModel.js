/* eslint "max-len" : ["error", {"code": 190}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('../config');
const pgFormat = require('pg-format');
const time = require('../lib/time');

/**
 * @param {*} from
 * @param {*} to
 * @return {Promise}
 */
function sentToDashboard(documentNumberList) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const {peruvianDateCurrent} = time.getTimeNow();
    const query = pgFormat(`
        update ${PGSCHEMA}.dt_pacientes set
            estado = 2,
            factor_riesgo = false,
            paso_encuesta_inicial = true,
            tipo_documento = 1,
            acepto_terminos = 2,
            acepto_terminos_datos = 2,
            fecha_respuesta_terminos = %L
        where dni in (%L);
        `, peruvianDateCurrent, documentNumberList);
    console.log(query);
    const params = [];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * @param {*} from
 * @param {*} to
 * @return {Promise}
 */
 function updateGroupNote(documentNumberList, comment) {
    return new Promise(async (resolve, reject)=>{
      const client = await openConnection();
      const query = pgFormat(`
          update ${PGSCHEMA}.dt_pacientes set
              nota_grupo = %L
          where dni in (%L);
          `, comment, documentNumberList);
      console.log(query);
      const params = [];
      const result = await client.query(query, params);
      client.release(true);
      resolve(result.rows);
    });
  }

/**
 * @param {*} from
 * @param {*} to
 * @return {Promise}
 */
 function forceSentToDashboard(documentNumberList) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const {peruvianDateInit} = time.getTimeNow();
    const query = pgFormat(`
    INSERT INTO ${PGSCHEMA}.dt_casos_dia(dni_paciente,fiebre,dificultad_respitar,dolor_pecho,
          alteracion_sensorio,colaboracion_azul_labios,tos,dolor_garganta,congestion_nasal,malestar_general,cefalea,
          nauseas,diarrea,comentario,fecha_caso, dni_medico, estado_caso, fecha_tomado )
          SELECT p.dni, 0,0,0,0,0,0,0,0,0,0,0,0,'', %L, 
          (select dni_medico from ${PGSCHEMA}.dt_casos_programados
                  where dni_paciente = p.dni 
                  and fecha = %L
                  and estado = 1 limit 1) as dni_medico,
                  case when (select dni_medico from ${PGSCHEMA}.dt_casos_programados
                  where dni_paciente = p.dni 
                  and fecha = %L
                  and estado = 1 limit 1) is null then 1 else 2 end,
                  %L
          FROM ${PGSCHEMA}.dt_pacientes p
          where p.estado in (2, 3) and p.paso_encuesta_inicial = true
      and p.dni in (%L)
      and not p.dni in (
        select cd.dni_paciente from ${PGSCHEMA}.dt_casos_dia as cd
        where cd.fecha_caso = %L
      );`, peruvianDateInit, peruvianDateInit, peruvianDateInit, peruvianDateInit, documentNumberList, peruvianDateInit);
    console.log(query);
    const params = [];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

  module.exports = {
    updateGroupNote,
    sentToDashboard,
    forceSentToDashboard,
  };
