const { openConnection } = require("./connection")
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
                    from development.dt_casos_dia as c
                    inner join development.dt_pacientes as p on c.dni_paciente = p.dni
                    where c.fecha_caso = $2 and c.estado_caso = 1 and p.estado = 3 order by p.edad desc;`
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
                    from development.dt_casos_dia as c
                    inner join development.dt_pacientes as p on c.dni_paciente = p.dni
                    where c.fecha_caso = $2 and c.estado_caso = 1 and p.estado = 2 order by p.edad desc;`
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
                    from development.dt_casos_dia as c
                    inner join development.dt_pacientes as p on c.dni_paciente = p.dni
                    where c.fecha_caso = $2 and c.estado_caso = 2 and c.dni_medico = $3 order by p.edad desc;`
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
        let query = `select count(*) from development.dt_casos_dia as pr
                        where fecha_caso = $1`
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
        let query = `select count(*) from development.dt_casos_dia as pr
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
        let query = `select count(*) from development.dt_casos_dia as pr
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
        let query = `select dni_medico, count(*)  from development.dt_casos_dia as pr
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
        let query = `update development.dt_casos_dia set dni_medico = $1, estado_caso = 2, fecha_tomado = $2 where id = $3`
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
        let query = `update development.dt_casos_dia set dni_medico = $1, estado_caso = 3, fecha_cierre_caso = $2 where id = $3`
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
        let query = `select * from sp_take_case($1, $2)`
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
        let query = `select * from sp_terminate_case($1, $2)`
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
        let query = `select p.*, p.nombre , p.celular, p.fijo, p.grupo, p.factor_riesgo, p.estado , p.fecha_inicio_sintomas,
                    extract(day from ($1 - p.fecha_creacion)) as tiempo_seguimiento, 
                    (select pr.resultado from development.dt_pruebas as pr where pr.dni_paciente = p.dni and pr.tipo = 'rapida' order by pr.fecha_resultado_prueba desc limit 1) as resultado_rapido,
                    (select pr.resultado from development.dt_pruebas as pr where pr.dni_paciente = p.dni and pr.tipo = 'molecular' order by pr.fecha_resultado_prueba desc limit 1) as resultado_molecular,
                    c.*
                    from development.dt_casos_dia as c
                    inner join development.dt_pacientes as p
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
        let query = `select id, descripcion from development.dm_estados_pacientes where flag = true`
        let params = []
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function updateCase(json, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { id_caso, grupo, factor_riesgo, estado, resultado_prueba_1, 
            resultado_prueba_2, resultado_prueba_3, fiebre, dificultad_respitar, dolor_pecho, alteracion_sensorio, colaboracion_azul_labios, 
            tos, dolor_garganta, congestion_nasal, malestar_general, cefalea, nauseas, diarrea, comentario } = json
        if(!client)
            client = await openConnection()
        let query = `select * from sp_update_case($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`
        let params = [id_caso, grupo, factor_riesgo, estado, resultado_prueba_1, resultado_prueba_2, resultado_prueba_3, fiebre, dificultad_respitar, dolor_pecho, alteracion_sensorio, colaboracion_azul_labios, tos, dolor_garganta, congestion_nasal, malestar_general, cefalea, nauseas, diarrea, comentario]
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
    getMyPatients
}