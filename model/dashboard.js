const { openConnection } = require("./connection")
const { PGSCHEMA } = require("./../config")
const moment = require('moment-timezone')


function getTimeNow(restar_day=0, restar_hour=0){
    let date = new Date()
    date.setDate(date.getDate() - restar_day)
    date.setHours(date.getHours() - restar_hour)
    let datePeru = moment.tz(date, "America/Lima");
    let day_string = `${datePeru.year().toString()}-${(datePeru.month() + 1).toString().padStart(2,"0")}-${datePeru.date().toString().padStart(2,"0")}`
    let datePeru_init = `${day_string}T00:00:00.000Z`
    let datePeru_finish = `${day_string}T23:59:59.0000Z`
    let clock_string = `${datePeru.hours().toString().padStart(2,"0")}:${datePeru.minutes().toString().padStart(2,"0")}:${datePeru.seconds().toString().padStart(2,"0")}.${datePeru.milliseconds().toString().padStart(3,'0')}Z`
    let datePeru_current = `${day_string}T${clock_string}`
    return {datePeru_init, datePeru_finish, datePeru_current}
}

function getPatientsAlert(pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init, datePeru_current } = getTimeNow()
        if(!client)
            client = await openConnection()
        
        let query = `select c.id as id_case, p.dni, p.nombre, p.sexo, p.edad, p.grupo, 
                        case when p.factor_riesgo then 'SI' else 'NO' end as factor_riesgo,
                        concat(extract(year from p.fecha_inicio_sintomas), '-', LPAD(extract(month from p.fecha_inicio_sintomas)::text, 2, '0'), '-',LPAD(extract(day from p.fecha_inicio_sintomas)::text, 2, '0')) as fecha_inicio_sintomas,
                        extract(day from ($1 - p.fecha_creacion)) as tiempo_seguimiento,
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
                        case when p.tipo_prueba_3 is null then '-' else p.tipo_prueba_3 end as tipo_prueba_3
                    from ${PGSCHEMA}.dt_casos_dia as c
                    inner join ${PGSCHEMA}.dt_pacientes as p on c.dni_paciente = p.dni
                    where c.fecha_caso = $2 and c.estado_caso = 1 and p.estado = 3 and p.grupo in ('C', 'B') order by p.edad desc;`
        let params = [datePeru_current, datePeru_init]
        let result = await client.query(query, params)

        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function getPatients(pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init, datePeru_current } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select c.id as id_case, p.dni, p.nombre, p.sexo, p.edad, p.grupo, 
                        concat(extract(year from p.fecha_inicio_sintomas), '-', LPAD(extract(month from p.fecha_inicio_sintomas)::text, 2, '0'), '-',LPAD(extract(day from p.fecha_inicio_sintomas)::text, 2, '0')) as fecha_inicio_sintomas,
                        case when p.factor_riesgo then 'SI' else 'NO' end as factor_riesgo,
                        extract(day from ($1 - p.fecha_creacion)) as tiempo_seguimiento,
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
                        case when p.tipo_prueba_3 is null then '-' else p.tipo_prueba_3 end as tipo_prueba_3
                    from ${PGSCHEMA}.dt_casos_dia as c
                    inner join ${PGSCHEMA}.dt_pacientes as p on c.dni_paciente = p.dni
                    where c.fecha_caso = $2 and c.estado_caso = 1 and p.estado = 2 and p.grupo in ('C', 'B') order by p.edad desc;`
        let params = [datePeru_current, datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function getMyPatients(dni_medico, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init, datePeru_current } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select c.id as id_case, p.dni, p.nombre, p.sexo, p.edad, p.grupo, 
                        case when p.factor_riesgo then 'SI' else 'NO' end as factor_riesgo,
                        concat(extract(year from p.fecha_inicio_sintomas), '-', LPAD(extract(month from p.fecha_inicio_sintomas)::text, 2, '0'), '-',LPAD(extract(day from p.fecha_inicio_sintomas)::text, 2, '0')) as fecha_inicio_sintomas,
                        extract(day from ($1 - p.fecha_creacion)) as tiempo_seguimiento,
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
                        case when p.tipo_prueba_3 is null then '-' else p.tipo_prueba_3 end as tipo_prueba_3
                    from ${PGSCHEMA}.dt_casos_dia as c
                    inner join ${PGSCHEMA}.dt_pacientes as p on c.dni_paciente = p.dni
                    where c.fecha_caso = $2 and c.estado_caso = 2 and c.dni_medico = $3 and p.grupo in ('C', 'B') order by p.edad desc;`
        let params = [datePeru_current, datePeru_init, dni_medico]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}


function countAllCaseToday(pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select count(*) from ${PGSCHEMA}.dt_casos_dia as pr
                        inner join ${PGSCHEMA}.dt_pacientes as p
                        on pr.dni_paciente = p.dni
                        where fecha_caso = $1 and estado_caso in (1,2) and p.grupo in ('C', 'B')`
        let params = [datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function countAllCaseAttendedToday(pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select count(*) from ${PGSCHEMA}.dt_casos_dia as pr
                    where fecha_caso = $1 and estado_caso = 3`
        let params = [datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function countAllCaseAttendedToDayForDoctor(dni_doctor, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select count(*) from ${PGSCHEMA}.dt_casos_dia as pr
                        where fecha_caso = $1 and estado_caso = 3 and dni_medico = $2`
        let params = [datePeru_init, dni_doctor]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function countAllCaseAttendedToDayBetweenDoctors(pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select dni_medico, count(*)  from ${PGSCHEMA}.dt_casos_dia as pr
                        where fecha_caso = $1 and estado_caso = 3
                        group by dni_medico`
        let params = [datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function takeCase(id_case, dni_doctor, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_current } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `update ${PGSCHEMA}.dt_casos_dia set dni_medico = $1, estado_caso = 2, fecha_tomado = $2 where id = $3`
        let params = [dni_doctor, datePeru_current, id_case]
        let result = await client.query(query, params)
        if(!pass)
            client.release(false)
        resolve({result : result.rows, client})
    })
}

function terminateCase(id_case, dni_doctor, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_current } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `update ${PGSCHEMA}.dt_casos_dia set dni_medico = $1, estado_caso = 3, fecha_cierre_caso = $2 where id = $3`
        let params = [dni_doctor, datePeru_current, id_case]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function canTakeCase(dni_medico, id_case, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_take_case($1, $2)`
        let params = [dni_medico, id_case]
        let result = await client.query(query, params)
        if(!pass)
            client.release(false)
        resolve({result : result.rows, client})
    })
}

function canTerminateCase(dni_medico, id_case, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_terminate_case($1, $2)`
        let params = [dni_medico, id_case]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function getCase(id_case, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_current } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select p.*, p.nombre , p.celular, p.fijo, p.grupo, p.factor_riesgo, p.estado , 
                    concat(extract(year from p.fecha_inicio_sintomas), '-', LPAD(extract(month from p.fecha_inicio_sintomas)::text, 2, '0'), '-',LPAD(extract(day from p.fecha_inicio_sintomas)::text, 2, '0')) as fecha_inicio_sintomas,
                    extract(day from ($1 - p.fecha_creacion)) as tiempo_seguimiento, 
                    (select pr.resultado from ${PGSCHEMA}.dt_pruebas as pr where pr.dni_paciente = p.dni and pr.tipo = 'rapida' order by pr.fecha_resultado_prueba desc limit 1) as resultado_rapido,
                    (select pr.resultado from ${PGSCHEMA}.dt_pruebas as pr where pr.dni_paciente = p.dni and pr.tipo = 'molecular' order by pr.fecha_resultado_prueba desc limit 1) as resultado_molecular,
                    c.*
                    from ${PGSCHEMA}.dt_casos_dia as c
                    inner join ${PGSCHEMA}.dt_pacientes as p
                    on c.dni_paciente = p.dni
                    where c.id = $2`
        let params = [datePeru_current, id_case]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function getStatusPatients(pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `select id, descripcion from ${PGSCHEMA}.dm_estados_pacientes where flag = true`
        let params = []
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function updateCase(json, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { id_caso, grupo, factor_riesgo, resultado_prueba_1, resultado_prueba_2, resultado_prueba_3, estado, fibre, dificultad_respitar, dolor_pecho, alteracion_sensorio, colaboracion_azul_labios, 
            tos, dolor_garganta, congestion_nasal, malestar_general, cefalea, nauseas, diarrea, comentario, fecha_inicio_sintomas } = json

        // let resultado_prueba_1 = null
        // let resultado_prueba_2 = null
        // let resultado_prueba_3 = null

        if(id_caso){
            id_caso = parseInt(id_caso)
        }
        if(factor_riesgo){
            factor_riesgo = factor_riesgo == 'true'? true : false
        }
        if(estado){
            estado = parseInt(estado)
        }
        if(resultado_prueba_1){
            resultado_prueba_1 = parseInt(json.resultado_prueba_1)
        }
        else{
            resultado_prueba_1 = null
        }
        if(resultado_prueba_2){
            resultado_prueba_2 = parseInt(json.resultado_prueba_2)
        }
        else{
            resultado_prueba_2 = null
        }
        if(resultado_prueba_3){
            resultado_prueba_3 = parseInt(json.resultado_prueba_3)
        }
        else{
            resultado_prueba_3 = null
        }
        if(fibre){
            fibre = parseInt(fibre)
        }
        if(dificultad_respitar){
            dificultad_respitar = parseInt(dificultad_respitar)
        }
        if(dolor_pecho){
            dolor_pecho = parseInt(dolor_pecho)
        }
        if(alteracion_sensorio){
            alteracion_sensorio = parseInt(alteracion_sensorio)
        }
        if(colaboracion_azul_labios){
            colaboracion_azul_labios = parseInt(colaboracion_azul_labios)
        }
        if(tos){
            tos = parseInt(tos)
        }
        if(dolor_garganta){
            dolor_garganta = parseInt(dolor_garganta)
        }
        if(congestion_nasal){
            congestion_nasal = parseInt(congestion_nasal)
        }
        if(malestar_general){
            malestar_general = parseInt(malestar_general)
        }
        if(cefalea){
            cefalea = parseInt(cefalea)
        }
        if(nauseas){
            nauseas = parseInt(nauseas)
        }
        if(diarrea){
            diarrea = parseInt(diarrea)
        }
        if(!fecha_inicio_sintomas){
            fecha_inicio_sintomas = null
        }
        if(!client)
            client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_update_case($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`
        let params = [id_caso, grupo, factor_riesgo, estado, resultado_prueba_1, resultado_prueba_2, resultado_prueba_3, fibre, dificultad_respitar, dolor_pecho, alteracion_sensorio, colaboracion_azul_labios, tos, dolor_garganta, congestion_nasal, malestar_general, cefalea, nauseas, diarrea, comentario, fecha_inicio_sintomas]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function dropCase(id_caso,pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `update ${PGSCHEMA}.dt_casos_dia set dni_medico = null, estado_caso = 1 where id = $1`
        let params = [id_caso]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
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
    dropCase
}