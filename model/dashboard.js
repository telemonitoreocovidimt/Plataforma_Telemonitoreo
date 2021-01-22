/* eslint 'max-len': ['error', {'code':250}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');
const {getTimeNow} = require('./../lib/time');

/**
 * Obtener bandeja de pacientes en alerta.
 * @function
 * @param {String} dniMedico Dni del medico
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function getPatientsAlert(dniMedico, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit, peruvianDateCurrent} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select c.id as id_case, p.dni, p.nombre, p.sexo, p.edad,p.grupo, 
          case when p.factor_riesgo then 'SI' else 'NO' end as factor_riesgo,
          concat(extract(year from p.fecha_inicio_sintomas), '-', LPAD(extract(month from p.fecha_inicio_sintomas)::text, 2, '0'), '-',LPAD(extract(day from p.fecha_inicio_sintomas)::text, 2, '0')) as fecha_inicio_sintomas,
          extract(day from ($1::date - p.fecha_creacion)) + 1 as tiempo_seguimiento,
          case when p.fecha_prueba_1 is null then '-' else concat(extract(day from p.fecha_prueba_1), '-', extract(month from p.fecha_prueba_1), '-', extract(year from p.fecha_prueba_1)) end as fecha_prueba_1,
          case when p.resultado_prueba_1 is null then '-' when p.resultado_prueba_1 = 3 then 'Positivo' when p.resultado_prueba_1 = 2 then 'Reactivo' else 'Negativo' end as resultado_prueba_1, 
          concat(extract(day from p.fecha_resultado_prueba_1), '-', extract(month from p.fecha_resultado_prueba_1), '-', extract(year from p.fecha_resultado_prueba_1)) as fecha_resultado_prueba_1, 
          case when p.tipo_prueba_1 is null then '-' else p.tipo_prueba_1 end as tipo_prueba_1,
          case when p.fecha_prueba_2 is null then '-' else concat(extract(day from p.fecha_prueba_2), '-', extract(month from p.fecha_prueba_2), '-', extract(year from p.fecha_prueba_2)) end as fecha_prueba_2,
          case when p.resultado_prueba_2 is null then '-' when p.resultado_prueba_2 = 3 then 'Positivo' when p.resultado_prueba_2 = 2 then 'Reactivo' else 'Negativo' end as resultado_prueba_2, 
          concat(extract(day from p.fecha_resultado_prueba_2), '-', extract(month from p.fecha_resultado_prueba_2), '-', extract(year from p.fecha_resultado_prueba_2)) as fecha_resultado_prueba_2, 
          case when p.tipo_prueba_2 is null then '-' else p.tipo_prueba_2 end as tipo_prueba_2,
          case when p.fecha_prueba_3 is null then '-' else concat(extract(day from p.fecha_prueba_3), '-', extract(month from p.fecha_prueba_3), '-', extract(year from p.fecha_prueba_3)) end as fecha_prueba_3,
          case when p.resultado_prueba_3 is null then '-' when p.resultado_prueba_3 = 3 then 'Positivo' when p.resultado_prueba_3 = 2 then 'Reactivo' else 'Negativo' end as resultado_prueba_3, 
          concat(extract(day from p.fecha_resultado_prueba_3), '-', extract(month from p.fecha_resultado_prueba_3), '-', extract(year from p.fecha_resultado_prueba_3)) as fecha_resultado_prueba_3, 
          case when p.tipo_prueba_3 is null then '-' else p.tipo_prueba_3 end as tipo_prueba_3,
          case when (select count(*) from ${PGSCHEMA}.dt_casos_dia as cd 
            where cd.dni_paciente = c.dni_paciente
            and cd.fecha_caso::date = $2::date - '1 day'::interval 
            and cd.dni_medico = $3)::int > 0 then 'SI'
            else 'NO' end as had_patient_yesterday,
          (select concat(mv.nombre, ' ', mv.apellido) from ${PGSCHEMA}.dt_casos_dia as cd
              inner join ${PGSCHEMA}.dm_medicos_voluntarios as mv
              on cd.dni_medico = mv.dni
              where cd.dni_paciente = c.dni_paciente
              and cd.fecha_caso::date = $2::date - '1 day'::interval LIMIT 1)::text as patient_yesterday,
          p.nota_grupo as nota_grupo
        from ${PGSCHEMA}.dt_casos_dia as c
        inner join ${PGSCHEMA}.dt_pacientes as p on c.dni_paciente = p.dni
        where  p.id_hospital in (select mv.id_hospital from development.dm_medicos_voluntarios as mv where mv.dni = $3) and
        c.fecha_caso = $2 and c.estado_caso = 1 and p.estado = 3 and p.grupo in ('C', 'B', 'A') order by p.edad desc;`;
    const params = [peruvianDateCurrent, peruvianDateInit, dniMedico];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rows, client});
  });
}

/**
 * Obtener bandeja de pacientes.
 * @function
 * @param {String} dniMedico Dni del medico
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function getPatients(dniMedico, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit, peruvianDateCurrent} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select c.id as id_case, p.dni, p.nombre, p.sexo, p.edad, p.grupo, 
            concat(extract(year from p.fecha_inicio_sintomas), '-', LPAD(extract(month from p.fecha_inicio_sintomas)::text, 2, '0'), '-',LPAD(extract(day from p.fecha_inicio_sintomas)::text, 2, '0')) as fecha_inicio_sintomas,
            case when p.factor_riesgo then 'SI' else 'NO' end as factor_riesgo,
            extract(day from ($1::date - p.fecha_creacion)) + 1 as tiempo_seguimiento,
            case when p.fecha_prueba_1 is null then '-' else concat(extract(day from p.fecha_prueba_1), '-', extract(month from p.fecha_prueba_1), '-', extract(year from p.fecha_prueba_1)) end as fecha_prueba_1,
            case when p.resultado_prueba_1 is null then '-' when p.resultado_prueba_1 = 3 then 'Positivo' when p.resultado_prueba_1 = 2 then 'Reactivo' else 'Negativo' end as resultado_prueba_1, 
            concat(extract(day from p.fecha_resultado_prueba_1), '-', extract(month from p.fecha_resultado_prueba_1), '-', extract(year from p.fecha_resultado_prueba_1)) as fecha_resultado_prueba_1, 
            case when p.tipo_prueba_1 is null then '-' else p.tipo_prueba_1 end as tipo_prueba_1,
            case when p.fecha_prueba_2 is null then '-' else concat(extract(day from p.fecha_prueba_2), '-', extract(month from p.fecha_prueba_2), '-', extract(year from p.fecha_prueba_2)) end as fecha_prueba_2,
            case when p.resultado_prueba_2 is null then '-' when p.resultado_prueba_2 = 3 then 'Positivo' when p.resultado_prueba_2 = 2 then 'Reactivo' else 'Negativo' end as resultado_prueba_2, 
            concat(extract(day from p.fecha_resultado_prueba_2), '-', extract(month from p.fecha_resultado_prueba_2), '-', extract(year from p.fecha_resultado_prueba_2)) as fecha_resultado_prueba_2, 
            case when p.tipo_prueba_2 is null then '-' else p.tipo_prueba_2 end as tipo_prueba_2,
            case when p.fecha_prueba_3 is null then '-' else concat(extract(day from p.fecha_prueba_3), '-', extract(month from p.fecha_prueba_3), '-', extract(year from p.fecha_prueba_3)) end as fecha_prueba_3,
            case when p.resultado_prueba_3 is null then '-' when p.resultado_prueba_3 = 3 then 'Positivo' when p.resultado_prueba_3 = 2 then 'Reactivo' else 'Negativo' end as resultado_prueba_3, 
            concat(extract(day from p.fecha_resultado_prueba_3), '-', extract(month from p.fecha_resultado_prueba_3), '-', extract(year from p.fecha_resultado_prueba_3)) as fecha_resultado_prueba_3, 
            case when p.tipo_prueba_3 is null then '-' else p.tipo_prueba_3 end as tipo_prueba_3,
            case when (select count(*) from ${PGSCHEMA}.dt_casos_dia as cd 
              where cd.dni_paciente = c.dni_paciente
              and cd.fecha_caso::date = $2::date - '1 day'::interval 
              and cd.dni_medico = $3)::int > 0 then 'SI'
              else 'NO' end as had_patient_yesterday,
            (select concat(mv.nombre, ' ', mv.apellido) from ${PGSCHEMA}.dt_casos_dia as cd
                inner join ${PGSCHEMA}.dm_medicos_voluntarios as mv
                on cd.dni_medico = mv.dni
                where cd.dni_paciente = c.dni_paciente
                and cd.fecha_caso::date = $2::date - '1 day'::interval LIMIT 1)::text as patient_yesterday,
            p.nota_grupo as nota_grupo
          from ${PGSCHEMA}.dt_casos_dia as c
          inner join ${PGSCHEMA}.dt_pacientes as p on c.dni_paciente = p.dni
          where p.id_hospital in (select mv.id_hospital from development.dm_medicos_voluntarios as mv where mv.dni = $3) and
          c.fecha_caso = $2 and c.estado_caso = 1 and p.estado = 2 and p.grupo in ('C', 'B', 'A') order by p.edad desc;`;
    const params = [peruvianDateCurrent, peruvianDateInit, dniMedico];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rows, client});
  });
}

/**
 * Obtener bandeja de pacientes de un determinado doctor.
 * @function
 * @param {String} dniMedico Dni del medico
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function getMyPatients(dniMedico, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit, peruvianDateCurrent} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select c.id as id_case, p.dni, p.nombre, p.sexo, p.edad, p.grupo, 
            case when p.factor_riesgo then 'SI' else 'NO' end as factor_riesgo,
            concat(extract(year from p.fecha_inicio_sintomas), '-', LPAD(extract(month from p.fecha_inicio_sintomas)::text, 2, '0'), '-',LPAD(extract(day from p.fecha_inicio_sintomas)::text, 2, '0')) as fecha_inicio_sintomas,
            extract(day from ($1::date - p.fecha_creacion)) + 1 as tiempo_seguimiento,
            case when p.fecha_prueba_1 is null then '-' else concat(extract(day from p.fecha_prueba_1), '-', extract(month from p.fecha_prueba_1), '-', extract(year from p.fecha_prueba_1)) end as fecha_prueba_1,
            case when p.resultado_prueba_1 is null then '-' when p.resultado_prueba_1 = 3 then 'Positivo' when p.resultado_prueba_1 = 2 then 'Reactivo' else 'Negativo' end as resultado_prueba_1, 
            concat(extract(day from p.fecha_resultado_prueba_1), '-', extract(month from p.fecha_resultado_prueba_1), '-', extract(year from p.fecha_resultado_prueba_1)) as fecha_resultado_prueba_1, 
            case when p.tipo_prueba_1 is null then '-' else p.tipo_prueba_1 end as tipo_prueba_1,
            case when p.fecha_prueba_2 is null then '-' else concat(extract(day from p.fecha_prueba_2), '-', extract(month from p.fecha_prueba_2), '-', extract(year from p.fecha_prueba_2)) end as fecha_prueba_2,
            case when p.resultado_prueba_2 is null then '-' when p.resultado_prueba_2 = 3 then 'Positivo' when p.resultado_prueba_2 = 2 then 'Reactivo' else 'Negativo' end as resultado_prueba_2, 
            concat(extract(day from p.fecha_resultado_prueba_2), '-', extract(month from p.fecha_resultado_prueba_2), '-', extract(year from p.fecha_resultado_prueba_2)) as fecha_resultado_prueba_2, 
            case when p.tipo_prueba_2 is null then '-' else p.tipo_prueba_2 end as tipo_prueba_2,
            case when p.fecha_prueba_3 is null then '-' else concat(extract(day from p.fecha_prueba_3), '-', extract(month from p.fecha_prueba_3), '-', extract(year from p.fecha_prueba_3)) end as fecha_prueba_3,
            case when p.resultado_prueba_3 is null then '-' when p.resultado_prueba_3 = 3 then 'Positivo' when p.resultado_prueba_3 = 2 then 'Reactivo' else 'Negativo' end as resultado_prueba_3, 
            concat(extract(day from p.fecha_resultado_prueba_3), '-', extract(month from p.fecha_resultado_prueba_3), '-', extract(year from p.fecha_resultado_prueba_3)) as fecha_resultado_prueba_3, 
            case when p.tipo_prueba_3 is null then '-' else p.tipo_prueba_3 end as tipo_prueba_3,
            case when (select count(*) from ${PGSCHEMA}.dt_casos_dia as cd 
              where cd.dni_paciente = c.dni_paciente
              and cd.fecha_caso::date = $2::date - '1 day'::interval 
              and cd.dni_medico = $3)::int > 0 then 'SI'
              else 'NO' end as had_patient_yesterday,
            (select concat(mv.nombre, ' ', mv.apellido) from ${PGSCHEMA}.dt_casos_dia as cd
              inner join ${PGSCHEMA}.dm_medicos_voluntarios as mv
              on cd.dni_medico = mv.dni
              where cd.dni_paciente = c.dni_paciente
              and cd.fecha_caso::date = $2::date - '1 day'::interval LIMIT 1)::text as patient_yesterday,              
            p.nota_grupo as nota_grupo
          from ${PGSCHEMA}.dt_casos_dia as c
          inner join ${PGSCHEMA}.dt_pacientes as p on c.dni_paciente = p.dni
          where p.id_hospital in (select mv.id_hospital from development.dm_medicos_voluntarios as mv where mv.dni = $3) and
          c.fecha_caso = $2 and c.estado_caso = 2 and c.dni_medico = $3 and p.grupo in ('C', 'B', 'A') order by p.edad desc;`;
    const params = [peruvianDateCurrent, peruvianDateInit, dniMedico];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rows, client});
  });
}

/**
 * Obtener el total de casos del dia por hospital
 * @function
 * @param {Number} idHospital ID de hospital
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function countAllCaseToday(idHospital, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select count(*) from ${PGSCHEMA}.dt_casos_dia as pr
            inner join ${PGSCHEMA}.dt_pacientes as p
            on pr.dni_paciente = p.dni
            where  p.id_hospital = $2 and fecha_caso = $1 and estado_caso in (1,2) and p.grupo in ('C', 'B', 'A')`;
    const params = [peruvianDateInit, idHospital];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rows, client});
  });
}

/**
 * Obtener el total de casos atendidos del dia por hospital
 * @function
 * @param {Number} idHospital ID de hospital
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function countAllCaseAttendedToday(idHospital, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select count(*) from ${PGSCHEMA}.dt_casos_dia as pr
            inner join ${PGSCHEMA}.dt_pacientes as p
            on pr.dni_paciente = p.dni
          where p.id_hospital = $2 and pr.fecha_caso = $1 and estado_caso = 3`;
    const params = [peruvianDateInit, idHospital];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rows, client});
  });
}

/**
 * Obtener el total de casos atendidos del dia por hospital y pordoctor
 * @function
 * @param {String} dniMedico Dni del medico
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function countAllCaseAttendedToDayForDoctor(dniMedico, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select count(*) from ${PGSCHEMA}.dt_casos_dia as pr
                inner join ${PGSCHEMA}.dm_medicos_voluntarios as mv
                on pr.dni_medico = mv.dni
                inner join ${PGSCHEMA}.dt_pacientes as p
                on pr.dni_paciente = p.dni
                where pr.fecha_caso = $1 and pr.estado_caso = 3 and pr.dni_medico = $2 and mv.id_hospital = p.id_hospital`;
    const params = [peruvianDateInit, dniMedico];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rows, client});
  });
}

/**
 * Obtener el promedio de casos atendidos por hospital
 * @function
 * @param {Number} idHospital ID de hospital
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function countAllCaseAttendedToDayBetweenDoctors(idHospital, pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select pr.dni_medico, count(*) from ${PGSCHEMA}.dt_casos_dia as pr
            inner join ${PGSCHEMA}.dm_medicos_voluntarios as mv
            on pr.dni_medico = mv.dni
            where pr.fecha_caso = $1 and pr.estado_caso = 3 and mv.id_hospital = $2
            group by pr.dni_medico`;
    const params = [peruvianDateInit, idHospital];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'result': result.rows, client});
  });
}

/**
 * Obtener todas las razones de pruebas
 * @param {Boolean} pass Saltar cierre de conexión
 * @param {Object} client Cliente postgresql
 * @return {Promise}
 */
function getTestReasons(pass=false, client=null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select * from ${PGSCHEMA}.dm_motivo_prueba order by id;`;
    const params = [];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({'results': result.rows, client});
  });
}

/** --------------------------------------------------------- */

function takeCase(id_case, dni_doctor, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateCurrent} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_casos_dia set dni_medico = $1, estado_caso = 2, fecha_tomado = $2 where id = $3`;
    const params = [dni_doctor, peruvianDateCurrent, id_case];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(false);
    }
    resolve({result: result.rows, client});
  });
}

function terminateCase(id_case, dni_doctor, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateCurrent} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_casos_dia set dni_medico = $1, estado_caso = 3, fecha_cierre_caso = $2 where id = $3`;
    const params = [dni_doctor, peruvianDateCurrent, id_case];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function addScheduledCase(dni_doctor, dni_paciente, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow(-1);
    if (!client) {
      client = await openConnection();
    }
    const query = `select * from ${PGSCHEMA}.sp_add_scheduled_case($1, $2, $3)`;
    const params = [dni_doctor, dni_paciente, peruvianDateInit];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function removeScheduledCase(dni_doctor, dni_paciente, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow(-1);
    if (!client) {
      client = await openConnection();
    }
    const query = `select * from ${PGSCHEMA}.sp_remove_scheduled_case($1, $2, $3)`;
    const params = [dni_doctor, dni_paciente, peruvianDateInit];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function canTakeCase(dni_medico, id_case, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select pasa as success, message from ${PGSCHEMA}.sp_take_case($1, $2)`;
    const params = [dni_medico, id_case];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(false);
    }
    resolve({result: result.rows[0], client});
  });
}

function canTerminateCase(dni_medico, id_case, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select pasa as pass, message from ${PGSCHEMA}.sp_terminate_case($1, $2)`;
    const params = [dni_medico, id_case];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows[0], client});
  });
}

function getCase(id_case, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateCurrent} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select TO_CHAR($1::date,'YYYY/MM/DD') as to_day , p.*, p.nombre , p.celular, p.fijo, p.grupo, p.factor_riesgo, p.estado , 
          concat(extract(year from p.fecha_inicio_sintomas), '-', LPAD(extract(month from p.fecha_inicio_sintomas)::text, 2, '0'), '-',LPAD(extract(day from p.fecha_inicio_sintomas)::text, 2, '0')) as fecha_inicio_sintomas,
          (extract(day from ($1::date - p.fecha_creacion)) + 1)::int as tiempo_seguimiento, 
          (select pr.resultado from ${PGSCHEMA}.dt_pruebas as pr where pr.dni_paciente = p.dni and pr.tipo = 'rapida' order by pr.fecha_resultado_prueba desc limit 1) as resultado_rapido,
          (select pr.resultado from ${PGSCHEMA}.dt_pruebas as pr where pr.dni_paciente = p.dni and pr.tipo = 'molecular' order by pr.fecha_resultado_prueba desc limit 1) as resultado_molecular,
          c.*
          from ${PGSCHEMA}.dt_casos_dia as c
          inner join ${PGSCHEMA}.dt_pacientes as p
          on c.dni_paciente = p.dni
          where c.id = $2`;
    const params = [peruvianDateCurrent, id_case];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows[0], client});
  });
}

function getStatusPatients(pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select id, descripcion from ${PGSCHEMA}.dm_estados_pacientes where flag = true`;
    const params = [];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({results: result.rows, client});
  });
}

/**
 * Actualizar los datos del caso y del paciente
 * @param {JSON} json
 * @param {Boolean} pass
 * @param {Object} client
 * @return {Promise}
 */
function updateCase(json, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    let {idCase,
      grupo,
      factor_riesgo,
      resultado_prueba_1,
      resultado_prueba_2,
      resultado_prueba_3,
      fecha_resultado_prueba_1,
      fecha_resultado_prueba_2,
      fecha_resultado_prueba_3,
      estado,
      fiebre,
      dificultad_respitar,
      dolor_pecho,
      alteracion_sensorio,
      colaboracion_azul_labios,
      tos,
      dolor_garganta,
      congestion_nasal,
      malestar_general,
      cefalea,
      nauseas,
      diarrea,
      comentario,
      fecha_inicio_sintomas,
      nota_grupo,
      condicion_egreso,
      temp_fv,
      fr_fv,
      fc_fv,
      sat_fv,
      disnea_sa,
      taqui_sa,
      saturacion_sa,
      alteracion_sa,
      otros_sa,
      otros,
      estado_evo,
      celular,
      sexo,
      dniPaciente,
      pais,
      provincia,
      distrito,
      direccion,
      motivo_prueba: idMotivoPrueba} = json;
    if (idMotivoPrueba == '') {
      idMotivoPrueba = null;
    }
    if (factor_riesgo) {
      factor_riesgo = factor_riesgo == 'true'? true : false;
    } else {
      factor_riesgo = null;
    }
    if (estado) {
      estado = parseInt(estado);
    }
    if (resultado_prueba_1) {
      resultado_prueba_1 = parseInt(json.resultado_prueba_1);
    } else {
      resultado_prueba_1 = null;
    }
    if (resultado_prueba_2) {
      resultado_prueba_2 = parseInt(json.resultado_prueba_2);
    } else {
      resultado_prueba_2 = null;
    }
    if (resultado_prueba_3) {
      resultado_prueba_3 = parseInt(json.resultado_prueba_3);
    } else {
      resultado_prueba_3 = null;
    }
    /**
     * Seguimiento
     */
    if (fiebre) {
      fiebre = 1;
    } else {
      fiebre = 0;
    }
    if (dificultad_respitar) {
      dificultad_respitar = 1;
    } else {
      dificultad_respitar = 0;
    }
    if (dolor_pecho) {
      dolor_pecho = 1;
    } else {
      dolor_pecho = 0;
    }
    if (alteracion_sensorio) {
      alteracion_sensorio = 1;
    } else {
      alteracion_sensorio = 0;
    }
    if (colaboracion_azul_labios) {
      colaboracion_azul_labios = 1;
    } else {
      colaboracion_azul_labios = 0;
    }
    if (tos) {
      tos = 1;
    } else {
      tos = 0;
    }
    if (dolor_garganta) {
      dolor_garganta = 1;
    } else {
      dolor_garganta = 0;
    }
    if (congestion_nasal) {
      congestion_nasal = 1;
    } else {
      congestion_nasal = 0;
    }
    if (malestar_general) {
      malestar_general = 1;
    } else {
      malestar_general = 0;
    }
    if (cefalea) {
      cefalea = 1;
    } else {
      cefalea = 0;
    }
    if (nauseas) {
      nauseas = 1;
    } else {
      nauseas = 0;
    }
    if (diarrea) {
      diarrea = 1;
    } else {
      diarrea = 0;
    }
    if (!fecha_inicio_sintomas) {
      fecha_inicio_sintomas = null;
    }
    if (fecha_resultado_prueba_1 == "") {
      fecha_resultado_prueba_1 = null;
    }
    if (fecha_resultado_prueba_2 == "") {
      fecha_resultado_prueba_2 = null;
    }
    if (fecha_resultado_prueba_3 == "") {
      fecha_resultado_prueba_3 = null;
    }
    
    /**
     * Seguimiento
    */
    if (isNaN(temp_fv)) {
      temp_fv = null;
    } else {
      temp_fv = parseFloat(temp_fv);
    }
    
    if (isNaN(fr_fv)) {
      fr_fv = null;
    } else {
      fr_fv = parseFloat(fr_fv);
    }
    
    if (isNaN(sat_fv)) {
      sat_fv = null;
    } else {
      sat_fv = parseFloat(sat_fv);
    }

    if (isNaN(fc_fv)) {
      fc_fv = null;
    } else {
      fc_fv = parseFloat(fc_fv);
    }


    if (disnea_sa) {
      disnea_sa = true;
    } else {
      disnea_sa = false;
    }
    if (taqui_sa) {
      taqui_sa = true;
    } else {
      taqui_sa = false;
    }
    if (saturacion_sa) {
      saturacion_sa = true;
    } else {
      saturacion_sa = false;
    }
    if (alteracion_sa) {
      alteracion_sa = true;
    } else {
      alteracion_sa = false;
    }
    if (otros_sa) {
      otros_sa = true;
    } else {
      otros_sa = false;
    }
    if (otros) {
      otros = true;
    } else {
      otros = false;
    }
    if (estado_evo) {
      estado_evo = parseInt(estado_evo);
    } else {
      estado_evo = 0;
    }
    if (condicion_egreso == '') {
      condicion_egreso = null;
    } else {
      condicion_egreso = parseInt(condicion_egreso);
    }

    if(!sexo || sexo == "") {
      sexo = null;
    } else {
      sexo = sexo.toUpperCase();
    }
    if (!client) {
      client = await openConnection();
    }
    let query = `update ${PGSCHEMA}.dt_pacientes set 
              grupo = $1,
              factor_riesgo = $2,
              estado = $3,
              resultado_prueba_1 = $4,
              resultado_prueba_2 = $5,
              resultado_prueba_3 = $6,
              fecha_inicio_sintomas = $7,
              condicion_egreso = $8,
              nota_grupo = $9,
              id_motivo_prueba = $10,
              fecha_resultado_prueba_1 = $12,
              fecha_resultado_prueba_2 = $13,
              fecha_resultado_prueba_3 = $14,
              celular = $15,
              sexo = $16,
              pais = $17,
              provincia = $18,
              distrito = $19,
              direccion = $20
              where dni = $11;`;
    let params = [grupo, factor_riesgo, estado, resultado_prueba_1, resultado_prueba_2, resultado_prueba_3, fecha_inicio_sintomas, condicion_egreso, nota_grupo, idMotivoPrueba, dniPaciente, fecha_resultado_prueba_1, fecha_resultado_prueba_2, fecha_resultado_prueba_3, celular, sexo,  pais, provincia, distrito, direccion];
    let result = await client.query(query, params);
    query = `update ${PGSCHEMA}.dt_casos_dia set
        temp_fv = $1,
        fr_fv = $2,
        disnea_sa = $3,
        taqui_sa = $4,
        saturacion_sa = $5,
        alteracion_sa = $6,
        otros_sa = $7,
        otros = $8,
        estado_evo = $9,
        fiebre = $10,
        dificultad_respitar = $11,
        dolor_pecho = $12,
        alteracion_sensorio = $13,
        colaboracion_azul_labios = $14,
        tos = $15,
        dolor_garganta = $16,
        congestion_nasal = $17,
        malestar_general = $18,
        cefalea = $19,
        nauseas = $20,
        diarrea = $21,
        comentario = $22,
        fc_fv = $24,
        sat_fv = $25
      where id = $23;`;
    params = [temp_fv, fr_fv, disnea_sa, taqui_sa, saturacion_sa, alteracion_sa, otros_sa, otros, estado_evo,
      fiebre, dificultad_respitar, dolor_pecho, alteracion_sensorio, colaboracion_azul_labios,
      tos, dolor_garganta, congestion_nasal, malestar_general, cefalea, nauseas, diarrea, comentario, idCase, fc_fv, sat_fv];
    console.log(params)
    result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function dropCase(id_caso, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_casos_dia set dni_medico = null, estado_caso = 1 where id = $1`;
    const params = [id_caso];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function getPatientForCase(id_case, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `SELECT p.* FROM ${PGSCHEMA}.dt_casos_dia as cd
          INNER JOIN ${PGSCHEMA}.dt_pacientes as p
          on cd.dni_paciente = p.dni
          WHERE cd.id = $1;`;
    const params = [id_case];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows[0], client});
  });
}

function haveThisScheduledCaseForTomorrow(dni_doctor, dni_paciente, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow(-1);
    if (!client) {
      client = await openConnection();
    }
    const query = `select * from ${PGSCHEMA}.dt_casos_programados as cp 
          where cp.dni_medico = $1 
          and cp.dni_paciente = $2 
          and cp.fecha = $3
          and cp.estado = 1`;
    const params = [dni_doctor, dni_paciente, peruvianDateInit];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows.length > 0 ? true : false, client});
  });
}

function getComentarios(dni, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `SELECT TO_CHAR(cd.fecha_caso,'DD/MM/YYYY') as fecha_caso,cd.comentario FROM ${PGSCHEMA}.dt_casos_dia as cd
          INNER JOIN ${PGSCHEMA}.dt_pacientes as p
          on cd.dni_paciente = p.dni
          WHERE cd.dni_paciente = $1 and  comentario is not null and comentario <> '' order by cd.fecha_caso desc;`;


    const params = [dni];
    const result = await client.query(query, params);

    if (!pass) {
      client.release(true);
    }
    resolve({results: result.rows, client});
  });
}


function getNoteByPatient(_dni = '', pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select ${PGSCHEMA}.sp_get_nota_patient($1) as note`;
    const params = [_dni];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function updateNoteByPatient(_dni = '', _note = '', pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select ${PGSCHEMA}.sp_update_nota_patient($1, $2) as status`;
    const params = [_dni, _note];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function getPreviousCases(dni_patient, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select *, TO_CHAR(c.fecha_caso,'YYYY/MM/DD') as fecha_caso_char, (extract(day from (c.fecha_caso - p.fecha_creacion)) + 1)::int as day_index
    from ${PGSCHEMA}.dt_casos_dia as c
    inner join ${PGSCHEMA}.dt_pacientes as p
    on c.dni_paciente = p.dni
    where c.dni_paciente = $2 
    and c.fecha_caso::date < $1::date order by c.fecha_caso asc`;
    const params = [peruvianDateInit, dni_patient];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({results: result.rows, client});
  });
}


/**
 * Funciones para tratamiento
 */

function getTreatment(id_caso_dia, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select id, id_tratamiento as type, nombre as name,
    id_razon as reason,
    id_detalle as detail,
    usando as using,
          TO_CHAR(fecha_desde,'YYYY-MM-DD') as init, TO_CHAR(fecha_hasta,'YYYY-MM-DD') as finish,
          observacion as observation  
          from ${PGSCHEMA}.dt_tratamientos_caso_dia where id_caso_dia = $1`;
    const params = [id_caso_dia];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({results: result.rows, client});
  });
}

function deleteTreatment(id_caso_dia, id_tratamiento, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `delete from ${PGSCHEMA}.dt_tratamientos_caso_dia where id_caso_dia = $1 and id_tratamiento = $2`;
    const params = [id_caso_dia, id_tratamiento];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function updateTreatment(id, id_caso_dia, id_tratamiento, nombre, fecha_desde, fecha_hasta, observacion, current_using, rea, det, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_tratamientos_caso_dia set
              nombre = $4,
              fecha_desde = $5,
              fecha_hasta = $6,
              observacion = $7,
              usando = $8,
              id_razon = $9,
              id_detalle = $10
          where id = $1 and id_tratamiento = $3 and id_caso_dia = $2`;
    const params = [id, id_caso_dia, id_tratamiento, nombre, fecha_desde, fecha_hasta, observacion, current_using, rea, det];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function insertTreatment(id_caso_dia, id_tratamiento, nombre, fecha_desde, fecha_hasta, observacion, current_using, rea, det,  pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `insert into ${PGSCHEMA}.dt_tratamientos_caso_dia (id_tratamiento, id_caso_dia, nombre, fecha_desde, fecha_hasta, observacion, usando, id_razon, id_detalle)
            values ($2, $1, $3, $4, $5, $6, $7, $8, $9)`;
    const params = [id_caso_dia, id_tratamiento, nombre, fecha_desde, fecha_hasta, observacion, current_using, rea, det];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}


/**
 * Contactos funciones
 */

function getContactByPatient(dni_patient, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select c.dni,
        c.edad,
        c.factor_riesgo,
        'CONTACTO' as seguimiento,
        c.nombre,
        c.observacion,
        cp.parentesco,
        (select $2::date - fecha_creacion::date + 1 from ${PGSCHEMA}.dt_contactos where dni = cp.dni_contacto and fecha_creacion = $2::date limit 1)::int as dia,
         
        (select id_status from ${PGSCHEMA}.dt_monitoreo_contactos where dni_contacto = cp.dni_contacto and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
        from ${PGSCHEMA}.dt_contactos_pacientes as cp
                    inner join ${PGSCHEMA}.dt_contactos as c
                    on cp.dni_contacto = c.dni
                    where cp.dni_paciente = $1;`;
    const params = [dni_patient, peruvianDateInit];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}


function getContactByid(dni_contact, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select * from ${PGSCHEMA}.dt_contactos
            where dni = $1 limit 1;`;
    const params = [dni_contact];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function insertContact(dni_contact, parentesco, name, age, factor, obs, phone, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `insert into ${PGSCHEMA}.dt_contactos(
            dni,
            parentesco,
            nombre,
            edad,
            factor_riesgo,
            observacion,
            celular
          ) values($1, $2, $3, $4, $5, $6, $7);`;
    const params = [dni_contact, parentesco, name, age, factor, obs, phone];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function updateRelationshipContactPatient(dni_contact, dni_patient, parentesco, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_contactos_pacientes
          set parentesco = $3 where dni_contacto = $1 and dni_paciente = $2;`;
    const params = [dni_contact, dni_patient, parentesco];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function insertRelationshipContactPatient(dni_contact, dni_patient, parentesco, status, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `insert into ${PGSCHEMA}.dt_contactos_pacientes(
      dni_contacto,
      dni_paciente,
      flag,
      parentesco
    )
    values ($1, $2, $4, $3);`;
    const params = [dni_contact, dni_patient, parentesco, status];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}


function getRelationshipContactPatient(dni_contact, dni_patient, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `select * from ${PGSCHEMA}.dt_contactos_pacientes
    where dni_contacto = $1 and dni_paciente = $2; `;
    const params = [dni_contact, dni_patient];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}


function deleteRelationshipContactPatient(dni_contact, dni_patient, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `delete from ${PGSCHEMA}.dt_contactos_pacientes where dni_contacto = $1 and dni_paciente = $2;`;
    const params = [dni_contact, dni_patient];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}


function updateContact(dni_contact, parentesco, name, age, factor, obs, phone, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    let query = `update ${PGSCHEMA}.dt_contactos set
            parentesco = $2,
            nombre = $3,
            edad = $4,
            factor_riesgo = $5,
            observacion = $6,
            celular = $7
          where dni = $1;`;
    let params = [dni_contact, parentesco, name, age, factor, obs, phone];
    let result = await client.query(query, params);

    query = `update ${PGSCHEMA}.dt_pacientes set
            nombre = $1,
            edad = $2,
            factor_riesgo = $3,
            celular = $4
          where dni = $5;`;
    params = [name, age, factor, phone, dni_contact];
    result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    // console.log('Rows : ', result);
    resolve({result: result.rows, client});
  });
}
/**
 * 
 * @param {*} dniPatient
 * @param {*} tipoPrueba1
 * @param {*} fechaResultadoPrueba1
 * @param {*} resultadoPrueba1
 * @param {*} tipoPrueba2
 * @param {*} fechaResultadoPrueba2
 * @param {*} resultadoPrueba2
 * @param {*} tipoPrueba3
 * @param {*} fechaResultadoPrueba3
 * @param {*} resultadoPrueba3
 * @param {*} pass
 * @param {*} client
 * @return {Promise}
 */
function updatePatientTest(dniPatient,
    tipoPrueba1,
    fechaResultadoPrueba1,
    resultadoPrueba1,
    tipoPrueba2,
    fechaResultadoPrueba2,
    resultadoPrueba2,
    tipoPrueba3,
    fechaResultadoPrueba3,
    resultadoPrueba3, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_pacientes set
            tipo_prueba_1 = $2,
            fecha_resultado_prueba_1 = $3,
            resultado_prueba_1 = $4,
            tipo_prueba_2 = $5,
            fecha_resultado_prueba_2 = $6,
            resultado_prueba_2 = $7,
            tipo_prueba_3 = $8,
            fecha_resultado_prueba_3 = $9,
            resultado_prueba_3 = $10
          where dni = $1;`;
    const params = [dniPatient,
      tipoPrueba1 == '' ? null : tipoPrueba1,
      fechaResultadoPrueba1 == '' ? null : fechaResultadoPrueba1,
      resultadoPrueba1,
      tipoPrueba2 == '' ? null : tipoPrueba2,
      fechaResultadoPrueba2 == '' ? null : fechaResultadoPrueba2,
      resultadoPrueba2,
      tipoPrueba3 == '' ? null : tipoPrueba3,
      fechaResultadoPrueba3 == '' ? null : fechaResultadoPrueba3,
      resultadoPrueba3];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    // console.log(query);
    // console.log(params);
    // console.log('Rows : ', result);
    resolve({result: result.rows, client});
  });
}

function updateContactMonitor(dni_contact, status, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_monitoreo_contactos set
        id_status = $3
        where fecha_monitoreo::date = $2::date and dni_contacto = $1`;
    const params = [dni_contact, peruvianDateInit, status];
    // console.log(params);
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function insertContactMonitor(dni_contact, status, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `insert into ${PGSCHEMA}.dt_monitoreo_contactos
    (dni_contacto, fecha_monitoreo, id_status)
    values ($1, $2, $3)`;
    const params = [dni_contact, peruvianDateInit, status];
    // console.log(params);
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}


function getContactMonitorToDay(dni_contact, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select * from ${PGSCHEMA}.dt_monitoreo_contactos
    where fecha_monitoreo::date = $2::date and dni_contacto = $1`;
    const params = [dni_contact, peruvianDateInit];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}


function listContacts(dni_paciente, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select cp.dni_contacto as dni,
        case when (select edad from ${PGSCHEMA}.dt_pacientes where dni = cp.dni_contacto limit 1)::int is null then c.edad
        else (select edad from ${PGSCHEMA}.dt_pacientes where dni = cp.dni_contacto limit 1)::int end as edad,
        
        case when (select factor_riesgo from ${PGSCHEMA}.dt_pacientes where dni = cp.dni_contacto limit 1)::boolean is null then c.factor_riesgo
        else (select factor_riesgo from ${PGSCHEMA}.dt_pacientes where dni = cp.dni_contacto limit 1)::boolean end as factor_riesgo,

        case when (select count(*) from ${PGSCHEMA}.dt_pacientes where dni = cp.dni_contacto)::int > 0 then 1
        when cp.flag then 2
        else 3 end as seguimiento,
        c.nombre,
        c.observacion,
        c.celular,
        cp.parentesco,

        p.tipo_prueba_1,
        p.resultado_prueba_1,
        p.fecha_resultado_prueba_1,
        p.tipo_prueba_2,
        p.resultado_prueba_2,
        p.fecha_resultado_prueba_2,
        p.tipo_prueba_3,
        p.resultado_prueba_3,
        p.fecha_resultado_prueba_3,


        ($2::date - c.fecha_creacion::date + 1)::int as dia,
        (select id_status from ${PGSCHEMA}.dt_monitoreo_contactos where dni_contacto = cp.dni_contacto and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
        from ${PGSCHEMA}.dt_contactos_pacientes as cp
        left join ${PGSCHEMA}.dt_contactos as c
        on cp.dni_contacto = c.dni
        left join ${PGSCHEMA}.dt_pacientes as p
        on cp.dni_contacto = p.dni
        where cp.dni_paciente = $1;`;
    const params = [dni_paciente, peruvianDateInit];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({results: result.rows, client});
  });
}

function listContactsByDNI(dni_contact, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select *,
          dc.fecha_creacion - $2::date + 1 as dia,
          (select case
            when (select count(*) from ${PGSCHEMA}.dt_pacientes where dni = dc.dni)::int > 0 then 'PACIENTE'
            when (select count(*) from ${PGSCHEMA}.dt_contactos_pacientes where dni_paciente = dc.dni)::int > 0 then 'CONTACTO'
            else 'NO' end)::text as seguimiento,
          (select id_status::char(1) from ${PGSCHEMA}.dt_monitoreo_contactos as mc
          where mc.dni_contacto = dc.dni and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
          from ${PGSCHEMA}.dt_contactos as dc
          where dc.dni = $1`;
    const params = [dni_contact, peruvianDateInit];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}


// Ajax search DNI

function getPatientContactByDNI(dni_contact, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select p.dni,
          case when c.edad is null then p.edad else c.edad end,
          p.factor_riesgo,
          1 as seguimiento,
          p.nombre,
          c.observacion,
          p.celular,

          p.tipo_prueba_1,
          p.resultado_prueba_1,
          p.fecha_resultado_prueba_1,
          p.tipo_prueba_2,
          p.resultado_prueba_2,
          p.fecha_resultado_prueba_2,
          p.tipo_prueba_3,
          p.resultado_prueba_3,
          p.fecha_resultado_prueba_3,

          '' as parentesco,
          ($2::date - c.fecha_creacion::date + 1)::int as dia,
          (select id_status from ${PGSCHEMA}.dt_monitoreo_contactos 
            where dni_contacto = c.dni and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
          from ${PGSCHEMA}.dt_pacientes as p
          left join ${PGSCHEMA}.dt_contactos as c
          on p.dni = c.dni
          where p.dni = $1;`;
    const params = [dni_contact, peruvianDateInit];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function getContactByDNI(dni_contact, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }

    const query = `select c.dni,
        c.edad,
        c.factor_riesgo,
        3 as seguimiento,
        c.nombre,
        c.observacion,
        c.celular,
        '' as parentesco,
        ($2::date - fecha_creacion::date + 1) as dia,
        (select id_status from ${PGSCHEMA}.dt_monitoreo_contactos where dni_contacto = c.dni and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
        from ${PGSCHEMA}.dt_contactos as c
        where c.dni = $1 limit 1;`;
    const params = [dni_contact, peruvianDateInit];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result.rows, client});
  });
}

function getMonitoreoContactsByDNI(dni_contact, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    const {peruvianDateInit} = getTimeNow();
    if (!client) {
      client = await openConnection();
    }
    const query = `select (mc.fecha_monitoreo - c.fecha_creacion::date + 1) as dia, 
    mc.id_status as monitoreo  from ${PGSCHEMA}.dt_monitoreo_contactos as mc
    INNER join ${PGSCHEMA}.dt_contactos as c
    on mc.dni_contacto = c.dni
    where dni_contacto = $1 and fecha_monitoreo < $2::date;`;
    const params = [dni_contact, peruvianDateInit];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({results: result.rows, client});
  });
}


function removePermissionContact(dni_contact, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_contactos_pacientes set
            flag = false where dni_contacto = $1;`;
    const params = [dni_contact];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result, client});
  });
}

function addPermissionContact(dni_contact, dni_patient, pass = false, client = null) {
  return new Promise(async (resolve, reject)=>{
    if (!client) {
      client = await openConnection();
    }
    const query = `update ${PGSCHEMA}.dt_contactos_pacientes set
            flag = true where dni_contacto = $1 and dni_paciente = $2;`;
    const params = [dni_contact, dni_patient];
    const result = await client.query(query, params);
    if (!pass) {
      client.release(true);
    }
    resolve({result: result, client});
  });
}

module.exports = {
  getPatientsAlert,
  getPatients,
  countAllCaseToday,
  countAllCaseAttendedToday,
  countAllCaseAttendedToDayForDoctor,
  countAllCaseAttendedToDayBetweenDoctors,
  takeCase,
  canTakeCase,
  getCase,
  getStatusPatients,
  canTerminateCase,
  terminateCase,
  updateCase,
  getMyPatients,
  dropCase,
  addScheduledCase,
  removeScheduledCase,
  getPatientForCase,
  haveThisScheduledCaseForTomorrow,
  getComentarios,
  getNoteByPatient,
  updateNoteByPatient,
  getPreviousCases,
  getTreatment,
  deleteTreatment,
  updateTreatment,
  insertTreatment,
  listContactsByDNI,
  getPatientContactByDNI,
  getContactByDNI,
  getMonitoreoContactsByDNI,
  getContactByPatient,
  deleteRelationshipContactPatient,
  updateRelationshipContactPatient,
  updateContact,
  updateContactMonitor,
  insertContact,
  getContactByid,
  insertRelationshipContactPatient,
  insertContactMonitor,
  getContactMonitorToDay,
  listContacts,
  addPermissionContact,
  removePermissionContact,
  getTestReasons,
  updatePatientTest,
};
