const {openConnection} = require('./connection');
const moment = require('moment-timezone');
const {PGSCHEMA} = require('./../config');

function getTimeNow(restar_day=0, restar_hour=0) {
  const date = new Date();
  date.setDate(date.getDate() - restar_day);
  date.setHours(date.getHours() - restar_hour);
  const datePeru = moment.tz(date, 'America/Lima');
  const day_string = `${datePeru.year().toString()}-${(datePeru.month() + 1).toString().padStart(2, '0')}-${datePeru.date().toString().padStart(2, '0')}`;
  const datePeru_init = `${day_string}T00:00:00.000Z`;
  const datePeru_finish = `${day_string}T23:59:59.0000Z`;
  const clock_string = `${datePeru.hours().toString().padStart(2, '0')}:${datePeru.minutes().toString().padStart(2, '0')}:${datePeru.seconds().toString().padStart(2, '0')}.${datePeru.milliseconds().toString().padStart(3, '0')}Z`;
  const datePeru_current = `${day_string}T${clock_string}`;
  return {datePeru_init, datePeru_finish, datePeru_current};
}

/**
 * @function
 * @return {Promise}
 */
function makeMigrations() {
  return new Promise(async (resolve, reject)=>{
    const {datePeru_current} = getTimeNow();
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
        where p.estado in (2, 3) and p.paso_encuesta_inicial = true and p.is_doctor = false`;// and not p.grupo = 'A';`
    params = [datePeru_current];
    result = await client.query(query, params);
    client.release(true);
    resolve(result.rowCount);
  });
}


function makeMigrationsCustomer(dni_paciente) {
  return new Promise(async (resolve, reject)=>{
    const {datePeru_current} = getTimeNow();
    const client = await openConnection();
    const query = `INSERT INTO ${PGSCHEMA}.dt_casos_dia(dni_paciente,estado_caso,fiebre,dificultad_respitar,dolor_pecho,
                    alteracion_sensorio,colaboracion_azul_labios,tos,dolor_garganta,congestion_nasal,malestar_general,cefalea,
                    nauseas,diarrea,comentario,fecha_caso)
                    SELECT p.dni, 1, 0,0,0,0,0,0,0,0,0,0,0,0,'', $1 FROM ${PGSCHEMA}.dt_pacientes p
                    where paso_encuesta_inicial = true and not p.grupo = 'A' and p.dni = $2;`;
    const params = [datePeru_current, dni_paciente];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}


function makeMigrationsNextUploaded() {
  return new Promise(async (resolve, reject)=>{
    const {datePeru_current} = getTimeNow();
    const client = await openConnection();
    const query = `INSERT INTO ${PGSCHEMA}.dt_casos_dia(dni_paciente,estado_caso,fiebre,dificultad_respitar,dolor_pecho,
                alteracion_sensorio,colaboracion_azul_labios,tos,dolor_garganta,congestion_nasal,malestar_general,cefalea,
                nauseas,diarrea,comentario,fecha_caso)
                SELECT p.dni, 1, 0,0,0,0,0,0,0,0,0,0,0,0,'', $1 FROM ${PGSCHEMA}.dt_pacientes p
                where p.estado in (2, 3) and paso_encuesta_inicial = true 
                and not p.grupo = 'A' and not p.dni in (select dni_paciente from ${PGSCHEMA}.dt_casos_dia as c where c.fecha_caso = $1 group by dni_paciente);`;
    const params = [datePeru_current];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

module.exports = {
  makeMigrations,
  makeMigrationsCustomer,
  makeMigrationsNextUploaded,
};
