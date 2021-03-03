const {openConnection} = require('./connection');
// const moment = require('moment-timezone');
const {PGSCHEMA} = require('./../config');
const {getTimeNow} = require('./../lib/time');

// function getTimeNow(restar_day=0, restar_hour=0) {
//   const date = new Date();
//   date.setDate(date.getDate() - restar_day);
//   date.setHours(date.getHours() - restar_hour);
//   const datePeru = moment.tz(date, 'America/Lima');
//   const day_string = `${datePeru.year().toString()}-${(datePeru.month() + 1).toString().padStart(2, '0')}-${datePeru.date().toString().padStart(2, '0')}`;
//   const datePeru_init = `${day_string}T00:00:00.000Z`;
//   const datePeru_finish = `${day_string}T23:59:59.0000Z`;
//   const clock_string = `${datePeru.hours().toString().padStart(2, '0')}:${datePeru.minutes().toString().padStart(2, '0')}:${datePeru.seconds().toString().padStart(2, '0')}.${datePeru.milliseconds().toString().padStart(3, '0')}Z`;
//   const peruvianDateCurrent = `${day_string}T${clock_string}`;
//   return {datePeru_init, datePeru_finish, peruvianDateCurrent};
// }

/**
 * @function
 * @return {Promise}
 */
function makeMigrations() {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateCurrent} = getTimeNow();
    const client = await openConnection();
    let query = `update ${PGSCHEMA}.dt_casos_dia set estado_caso = 4
                    where estado_caso in (1, 2);`;
    let params = [];
    let result = await client.query(query, params);
    query = `INSERT INTO ${PGSCHEMA}.dt_casos_dia(dni_paciente,fiebre,dificultad_respitar,dolor_pecho,
        alteracion_sensorio,colaboracion_azul_labios,tos,dolor_garganta,congestion_nasal,malestar_general,cefalea,
        nauseas,diarrea,comentario,fecha_caso, dni_medico, estado_caso, fecha_tomado )
        SELECT p.dni, 0,0,0,0,0,0,0,0,0,0,0,0,'', $1, 
        (select dni_medico from ${PGSCHEMA}.dt_casos_programados
                where dni_paciente = p.dni 
                and fecha = $1
                and estado = 1 limit 1) as dni_medico,
                case when (select dni_medico from ${PGSCHEMA}.dt_casos_programados
                where dni_paciente = p.dni 
                and fecha = $1
                and estado = 1 limit 1) is null then 1 else 2 end,
                $1
        FROM ${PGSCHEMA}.dt_pacientes p
        where p.estado in (2, 3) and p.paso_encuesta_inicial = true`;//and p.is_doctor = false and not p.grupo = 'A';`
    params = [peruvianDateCurrent];
    result = await client.query(query, params);
    client.release(true);
    resolve(result.rowCount);
  });
}

function makeMigrationsCustomer(dni_paciente) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateCurrent} = getTimeNow();
    const client = await openConnection();
    const query = `INSERT INTO ${PGSCHEMA}.dt_casos_dia(dni_paciente,estado_caso,fiebre,dificultad_respitar,dolor_pecho,
                    alteracion_sensorio,colaboracion_azul_labios,tos,dolor_garganta,congestion_nasal,malestar_general,cefalea,
                    nauseas,diarrea,comentario,fecha_caso)
                    SELECT p.dni, 1, 0,0,0,0,0,0,0,0,0,0,0,0,'', $1 FROM ${PGSCHEMA}.dt_pacientes p
                    where paso_encuesta_inicial = true and not p.grupo = 'A' and p.dni = $2;`;
    const params = [peruvianDateCurrent, dni_paciente];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

function makeMigrationsNextUploaded() {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateCurrent} = getTimeNow();
    const client = await openConnection();
    const query = `INSERT INTO ${PGSCHEMA}.dt_casos_dia(dni_paciente,estado_caso,fiebre,dificultad_respitar,dolor_pecho,
                alteracion_sensorio,colaboracion_azul_labios,tos,dolor_garganta,congestion_nasal,malestar_general,cefalea,
                nauseas,diarrea,comentario,fecha_caso)
                SELECT p.dni, 1, 0,0,0,0,0,0,0,0,0,0,0,0,'', $1 FROM ${PGSCHEMA}.dt_pacientes p
                where p.estado in (2, 3) and paso_encuesta_inicial = true 
                and not p.grupo = 'A' and not p.dni in (select dni_paciente from ${PGSCHEMA}.dt_casos_dia as c where c.fecha_caso = $1 group by dni_paciente);`;
    const params = [peruvianDateCurrent];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * Migrar pacientes para las encuestas por SMS
 * @return {Promise} Cantidad de registros migrados.
 */
function makeMigrationsPatientVaccineForm() {
  return new Promise(async (resolve, reject)=> {
    const {peruvianDateInit} = getTimeNow();
    const client = await openConnection();
    const query = `insert into ${PGSCHEMA}.dt_casos_vacuna_form (
      documento_identidad_paciente_vacuna,
      fecha_creacion,
      estado
    )
    select distinct p.* from (
        select documento_identidad, $1::date, 1 
          from ${PGSCHEMA}.dt_pacientes_vacuna
          where documento_identidad in (
            select documento_identidad_paciente_vacuna
            from ${PGSCHEMA}.dt_casos_vacuna_form
            where puntuacion > 0 
            and ($1::date - '1 day'::interval) = fecha_creacion::date)
        union
        select documento_identidad, $1::date, 1
          from ${PGSCHEMA}.dt_pacientes_vacuna
          where celular_validado > 0
          and estado in (5, 6)
          and  (
            ((
              (($1::date - fecha_respuesta_registro::date)::int < 7
                or mod(($1::date - fecha_respuesta_registro::date)::int, 7) = 0))
              and fecha_respuesta_registro_2 is null
            ) or
            ((
              (($1::date - fecha_respuesta_registro_2::date)::int < 7
                or mod(($1::date - fecha_respuesta_registro_2::date)::int, 7) = 0))
              and not fecha_respuesta_registro_2 is null
            )
            )
      ) as p`;
    // const query = `insert into ${PGSCHEMA}.dt_casos_vacuna_form (
    //   documento_identidad_paciente_vacuna,
    //   fecha_creacion,
    //   estado
    // )
    // select distinct p.* from (
    //     select documento_identidad, $1::date, 1 
    //       from ${PGSCHEMA}.dt_pacientes_vacuna
    //       where documento_identidad in (
    //         select documento_identidad_paciente_vacuna
    //         from ${PGSCHEMA}.dt_casos_vacuna_form
    //         where puntuacion > 0 
    //         and ($1::date - '1 day'::interval) = fecha_creacion::date)
    //     union
    //     select documento_identidad, $1::date, 1
    //       from ${PGSCHEMA}.dt_pacientes_vacuna
    //       where celular_validado > 0
    //       and estado in (5, 6)
    //       and (
    //         ($1::date - fecha_respuesta_registro::date)::int < 7
    //           or mod(($1::date - fecha_respuesta_registro::date)::int, 7) = 0)
    //   ) as p`;
    const params = [peruvianDateInit];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rowCount);
  });
}


/**
 * Migrar pacientes con vacuna para las encuestas por dashboard.
 * @return {Promise} Cantidad de registros migrados.
 */
function makeMigrationsPatientsWithVaccine() {
  return new Promise(async (resolve, reject)=> {
    const {peruvianDateInit} = getTimeNow();
    const client = await openConnection();
    const query = `insert into ${PGSCHEMA}.dt_casos_vacuna (
          documento_identidad_paciente_vacuna,
          fecha_creacion,
          estado
        ) select distinct documento_identidad_paciente_vacuna, $1::date, 1
        from ${PGSCHEMA}.dt_casos_vacuna
        where fecha_creacion = ($1::date - '1 day'::interval)
        and estado = 1;`;
    const params = [peruvianDateInit];
    console.log(params);
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rowCount);
  });
}

/**
 * Migrar paciente expecifico con vacuna para las encuestas por dashboard.
 * @param {String} numberDocument Numero del paciente con vacuna.
 * @return {Promise} Cantidad de registros migrados.
 */
function makeMigrationsPatientWithVaccine(numberDocument) {
  return new Promise(async (resolve, reject)=> {
    const {peruvianDateInit} = getTimeNow();
    const client = await openConnection();
    const query = `insert into ${PGSCHEMA}.dt_casos_vacuna (
          documento_identidad_paciente_vacuna,
          fecha_creacion,
          estado
        ) select distinct documento_identidad, $2::date, 1
        from ${PGSCHEMA}.dt_pacientes_vacuna
        where celular_validado > 0
        and estado = 6 and documento_identidad = $1;`;
    const params = [numberDocument, peruvianDateInit];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rowCount);
  });
}

/**
 * Migrar paciente expecifico con vacuna para las encuestas
 * por dashboard como alerta de mejora.
 * @param {String} numberDocument Numero del paciente con vacuna.
 * @return {Promise} Cantidad de registros migrados.
 */
function makeMigrationsPatientWithVaccineImproved(numberDocument) {
  return new Promise(async (resolve, reject)=> {
    const {peruvianDateInit} = getTimeNow();
    const client = await openConnection();
    const query = `insert into ${PGSCHEMA}.dt_casos_vacuna (
          documento_identidad_paciente_vacuna,
          fecha_creacion,
          estado,
          tipo_caso
        ) select distinct documento_identidad, $2::date, 1, 2
        from ${PGSCHEMA}.dt_pacientes_vacuna
        where celular_validado > 0 and documento_identidad = $1;`;
    const params = [numberDocument, peruvianDateInit];
    const result = await client.query(query, params);
    console.log(result);
    client.release(true);
    resolve(result.rowCount);
  });
}

module.exports = {
  makeMigrations,
  makeMigrationsCustomer,
  makeMigrationsNextUploaded,
  makeMigrationsPatientVaccineForm,
  makeMigrationsPatientsWithVaccine,
  makeMigrationsPatientWithVaccine,
  makeMigrationsPatientWithVaccineImproved,
};
