const { openConnection } = require("./connection")
const { PGSCHEMA } = require("./../config")
const moment = require('moment-timezone')
// const { parse } = require("dotenv/types")


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

function getPatientsAlert(dni_medico, pass = false, client = null){
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
                    where c.fecha_caso = $2 and c.estado_caso = 1 and p.estado = 3 and p.grupo in ('C', 'B', 'A') order by p.edad desc;`//('C', 'B') order by p.edad desc;
        let params = [datePeru_current, datePeru_init, dni_medico]
        let result = await client.query(query, params)

        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function getPatients(dni_medico, pass = false, client = null){
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
                    where c.fecha_caso = $2 and c.estado_caso = 1 and p.estado = 2 and p.grupo in ('C', 'B', 'A') order by p.edad desc;` //('C', 'B') order by p.edad desc;
        let params = [datePeru_current, datePeru_init, dni_medico]
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
                    where c.fecha_caso = $2 and c.estado_caso = 2 and c.dni_medico = $3 and p.grupo in ('C', 'B', 'A') order by p.edad desc;`//('C', 'B') order by p.edad desc;
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
                        where fecha_caso = $1 and estado_caso in (1,2) and p.grupo in ('C', 'B', 'A')`//('C', 'B')
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

function addScheduledCase(dni_doctor, dni_paciente, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow(-1)
        if(!client)
            client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_add_scheduled_case($1, $2, $3)`
        let params = [dni_doctor, dni_paciente, datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function removeScheduledCase(dni_doctor, dni_paciente, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow(-1)
        if(!client)
            client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_remove_scheduled_case($1, $2, $3)`
        let params = [dni_doctor, dni_paciente, datePeru_init]
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
        let query = `select TO_CHAR($1::date,'YYYY/MM/DD') as to_day , p.*, p.nombre , p.celular, p.fijo, p.grupo, p.factor_riesgo, p.estado , 
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
        let { id_caso, grupo, factor_riesgo, resultado_prueba_1, resultado_prueba_2, resultado_prueba_3, estado, fiebre, dificultad_respitar, dolor_pecho, alteracion_sensorio, colaboracion_azul_labios, 
            tos, dolor_garganta, congestion_nasal, malestar_general, cefalea, nauseas, diarrea, comentario, fecha_inicio_sintomas,nota_grupo,condicion_egreso, temp_fv, fr_fv, disnea_sa, taqui_sa, saturacion_sa, alteracion_sa, otros_sa, otros, estado_evo } = json

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

        /**
         * Seguimiento
         */
        if(fiebre){
            fiebre = 1
        }
        else{
            fiebre = 0
        }
        if(dificultad_respitar){
            dificultad_respitar = 1
        }
        else{
            dificultad_respitar = 0
        }
        if(dolor_pecho){
            dolor_pecho = 1
        }
        else{
            dolor_pecho = 0
        }
        if(alteracion_sensorio){
            alteracion_sensorio = 1
        }
        else{
            alteracion_sensorio = 0
        }
        if(colaboracion_azul_labios){
            colaboracion_azul_labios = 1
        }
        else{
            colaboracion_azul_labios = 0
        }
        if(tos){
            tos = 1
        }
        else{
            tos = 0
        }
        if(dolor_garganta){
            dolor_garganta = 1
        }
        else{
            dolor_garganta = 0
        }
        if(congestion_nasal){
            congestion_nasal = 1
        }
        else{
            congestion_nasal = 0
        }
        if(malestar_general){
            malestar_general = 1
        }
        else{
            malestar_general = 0
        }
        if(cefalea){
            cefalea = 1
        }
        else{
            cefalea = 0
        }
        if(nauseas){
            nauseas = 1
        }
        else{
            nauseas = 0
        }
        if(diarrea){
            diarrea = 1
        }
        else{
            diarrea = 0
        }

        if(!fecha_inicio_sintomas){
            fecha_inicio_sintomas = null
        }

        /**
         * Seguimiento
        */
       if(temp_fv){
           temp_fv = true
       }
       else{
           temp_fv = false
       }
       if(fr_fv){
           fr_fv = true
       }
       else{
           fr_fv = false
       }
       if(disnea_sa){
           disnea_sa = true
       }
       else{
           disnea_sa = false
       }
       if(taqui_sa){
           taqui_sa = true
       }
       else{
           taqui_sa = false
       }
       if(saturacion_sa){
           saturacion_sa = true
       }
       else{
           saturacion_sa = false
       }
       if(alteracion_sa){
           alteracion_sa = true
       }
       else{
           alteracion_sa = false
       }
       if(otros_sa){
           otros_sa = true
       }
       else{
           otros_sa = false
       }
       if(otros){
           otros = true
       }
       else{
           otros = false
       }
       if(estado_evo){
           estado_evo = parseInt(estado_evo)
       }
       else{
           estado_evo = 0
       }

        if(condicion_egreso == ''){
            condicion_egreso = null
        }
        else{
            condicion_egreso = parseInt(condicion_egreso)
        }
        if(!client)
            client = await openConnection()
        let query = `select * from ${PGSCHEMA}.sp_update_case($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21,$22,$23)`
        let params = [id_caso, grupo, factor_riesgo, estado, resultado_prueba_1, resultado_prueba_2, resultado_prueba_3, fiebre, dificultad_respitar, dolor_pecho, alteracion_sensorio, colaboracion_azul_labios, tos, dolor_garganta, congestion_nasal, malestar_general, cefalea, nauseas, diarrea, comentario, fecha_inicio_sintomas,nota_grupo,condicion_egreso]
        let result = await client.query(query, params)
        query = `update ${PGSCHEMA}.dt_casos_dia set
            temp_fv = $1,
            fr_fv = $2,
            disnea_sa = $3,
            taqui_sa = $4,
            saturacion_sa = $5,
            alteracion_sa = $6,
            otros_sa = $7,
            otros = $8,
            estado_evo = $9
            where id = $10;`
        params = [temp_fv, fr_fv, disnea_sa, taqui_sa, saturacion_sa, alteracion_sa, otros_sa, otros, estado_evo, id_caso]
        let result2 = await client.query(query, params)
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

function getPatientForCase(id_case, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `SELECT p.* FROM ${PGSCHEMA}.dt_casos_dia as cd
                    INNER JOIN ${PGSCHEMA}.dt_pacientes as p
                    on cd.dni_paciente = p.dni
                    WHERE cd.id = $1;`
        let params = [id_case]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function haveThisScheduledCaseForTomorrow(dni_doctor, dni_paciente, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow(-1)
        if(!client)
            client = await openConnection()
        let query = `select * from ${PGSCHEMA}.dt_casos_programados as cp 
                    where cp.dni_medico = $1 
                    and cp.dni_paciente = $2 
                    and cp.fecha = $3
                    and cp.estado = 1`
        let params = [dni_doctor, dni_paciente, datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function getComentarios(dni, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `SELECT TO_CHAR(cd.fecha_caso,'DD/MM/YYYY') as fecha_caso,cd.comentario FROM ${PGSCHEMA}.dt_casos_dia as cd
                    INNER JOIN ${PGSCHEMA}.dt_pacientes as p
                    on cd.dni_paciente = p.dni
                    WHERE cd.dni_paciente = $1 and  comentario is not null and comentario <> '' order by cd.fecha_caso desc;`;

     
        let params = [dni]
        let result = await client.query(query, params);
       
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}


function getNoteByPatient(_dni = '', pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `select ${PGSCHEMA}.sp_get_nota_patient($1) as note`
        let params = [_dni]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function updateNoteByPatient(_dni = '', _note = '',pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `select ${PGSCHEMA}.sp_update_nota_patient($1, $2) as status`
        let params = [_dni, _note]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function getPreviousCases(dni_patient, pass = false, client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select *, TO_CHAR(c.fecha_caso,'YYYY/MM/DD') as fecha_caso_char, extract(day from (c.fecha_caso - p.fecha_creacion)) as day_index
        from ${PGSCHEMA}.dt_casos_dia as c
        inner join ${PGSCHEMA}.dt_pacientes as p
        on c.dni_paciente = p.dni
        where c.dni_paciente = $2 
        and c.fecha_caso::date < $1::date order by c.fecha_caso asc`
        let params = [datePeru_init, dni_patient]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}





/**
 * Funciones para tratamiento
 */

function getTreatment(id_caso_dia ,pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
        client = await openConnection()
        let query = `select id, id_tratamiento as type, nombre as name, 
                    TO_CHAR(fecha_desde,'YYYY-MM-DD') as init, TO_CHAR(fecha_hasta,'YYYY-MM-DD') as finish,
                    observacion as observation  
                    from ${PGSCHEMA}.dt_tratamientos_caso_dia where id_caso_dia = $1`
        let params = [id_caso_dia]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function deleteTreatment(id_caso_dia, id_tratamiento, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
        client = await openConnection()
        let query = `delete from ${PGSCHEMA}.dt_tratamientos_caso_dia where id_caso_dia = $1 and id_tratamiento = $2`
        let params = [id_caso_dia, id_tratamiento]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function updateTreatment(id, id_caso_dia, id_tratamiento, nombre, fecha_desde, fecha_hasta, observacion,  pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
        client = await openConnection()
        let query = `update ${PGSCHEMA}.dt_tratamientos_caso_dia set
                            nombre = $4,
                            fecha_desde = $5,
                            fecha_hasta = $6,
                            observacion = $7
                    where id = $1 and id_tratamiento = $3 and id_caso_dia = $2`
        let params = [id, id_caso_dia, id_tratamiento, nombre, fecha_desde, fecha_hasta, observacion]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function insertTreatment(id_caso_dia, id_tratamiento, nombre, fecha_desde, fecha_hasta, observacion,  pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
        client = await openConnection()
        let query = `insert into ${PGSCHEMA}.dt_tratamientos_caso_dia (id_tratamiento, id_caso_dia, nombre, fecha_desde, fecha_hasta, observacion)
                        values ($2, $1, $3, $4, $5, $6)`
        let params = [id_caso_dia, id_tratamiento, nombre, fecha_desde, fecha_hasta, observacion]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}



/**
 * Contactos funciones
 */

function getContactByPatient(dni_patient, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select c.dni,
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
                                        where cp.dni_paciente = $1;`
        let params = [dni_patient, datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}


function getContactByid(dni_contact,  pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
        client = await openConnection()
        let query = `select * from ${PGSCHEMA}.dt_contactos
                        where dni = $1 limit 1;`
        let params = [dni_contact]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}


function insertContact(dni_contact, parentesco, name, age, factor, obs,  pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
        client = await openConnection()
        let query = `insert into ${PGSCHEMA}.dt_contactos(
                        dni,
                        parentesco,
                        nombre,
                        edad,
                        factor_riesgo,
                        observacion
                    ) values($1, $2, $3, $4, $5, $6);`
        let params = [dni_contact, parentesco, name, age, factor, obs]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function updateRelationshipContactPatient(dni_contact, dni_patient, parentesco,  pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
        client = await openConnection()
        let query = `update ${PGSCHEMA}.dt_contactos_pacientes
                    set parentesco = $3 where dni_contacto = $1 and dni_paciente = $2;`
        let params = [dni_contact, dni_patient, parentesco]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function insertRelationshipContactPatient(dni_contact, dni_patient, parentesco, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
        client = await openConnection()
        let query = `insert into ${PGSCHEMA}.dt_contactos_pacientes(
            dni_contacto,
            dni_paciente,
            flag,
            parentesco
        )
        values ($1, $2, false, $3);`
        let params = [dni_contact, dni_patient, parentesco]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}


function getRelationshipContactPatient(dni_contact, dni_patient,  pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
        client = await openConnection()
        let query = `select * from ${PGSCHEMA}.dt_contactos_pacientes
        where dni_contacto = $1 and dni_paciente = $2; `
        let params = [dni_contact, dni_patient]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}


function deleteRelationshipContactPatient(dni_contact, dni_patient,  pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
        client = await openConnection()
        let query = `delete from ${PGSCHEMA}.dt_contactos_pacientes where dni_contacto = $1 and dni_paciente = $2;`
        let params = [dni_contact, dni_patient]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}



function updateContact(dni_contact, parentesco, name, age, factor, obs,  pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `update ${PGSCHEMA}.dt_contactos set
                        parentesco = $2,
                        nombre = $3,
                        edad = $4,
                        factor_riesgo = $5,
                        observacion = $6
                    where dni = $1;`
        let params = [dni_contact, parentesco, name, age, factor, obs]
        console.log(query)
        console.log(params)
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        console.log("Rows : ", result)
        resolve({result : result.rows, client})
    })
}

function updateContactMonitor(dni_contact, status, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `update ${PGSCHEMA}.dt_monitoreo_contactos set
                id_status = $3
                where fecha_monitoreo::date = $2::date and dni_contacto = $1`
        let params = [dni_contact, datePeru_init, status]
        console.log(params)
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function insertContactMonitor(dni_contact, status, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `insert into ${PGSCHEMA}.dt_monitoreo_contactos
        (dni_contacto, fecha_monitoreo, id_status)
        values ($1, $2, $3)`
        let params = [dni_contact, datePeru_init, status]
        console.log(params)
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}


function getContactMonitorToDay(dni_contact, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select * from ${PGSCHEMA}.dt_monitoreo_contactos
        where fecha_monitoreo::date = $2::date and dni_contacto = $1`
        let params = [dni_contact, datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}



function listContact(dni_paciente,  pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
        client = await openConnection()
        let query = `select cp.dni_contacto as dni,
                case when (select edad from ${PGSCHEMA}.dt_pacientes where dni = cp.dni_contacto limit 1)::int is null then c.edad
                else (select edad from ${PGSCHEMA}.dt_pacientes where dni = cp.dni_contacto limit 1)::int end as edad,
                c.factor_riesgo,
                case when (select count(*) from ${PGSCHEMA}.dt_pacientes where dni = cp.dni_contacto)::int > 0 then 1
                when cp.flag then 2
                else 3 end as seguimiento,
                c.nombre,
                c.observacion,
                cp.parentesco,
                ($2::date - c.fecha_creacion::date + 1)::int as dia,
                (select id_status from ${PGSCHEMA}.dt_monitoreo_contactos where dni_contacto = cp.dni_contacto and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
                from ${PGSCHEMA}.dt_contactos_pacientes as cp
                left join ${PGSCHEMA}.dt_contactos as c
                on cp.dni_contacto = c.dni
                where cp.dni_paciente = $1;`
        let params = [dni_paciente, datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function listContactByDNI(dni_contact, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select *,
                    dc.fecha_creacion - $2::date + 1 as dia,
                    (select case
                        when (select count(*) from ${PGSCHEMA}.dt_pacientes where dni = dc.dni)::int > 0 then 'PACIENTE'
                        when (select count(*) from ${PGSCHEMA}.dt_contactos_pacientes where dni_paciente = dc.dni)::int > 0 then 'CONTACTO'
                        else 'NO' end)::text as seguimiento,
                    (select id_status::char(1) from ${PGSCHEMA}.dt_monitoreo_contactos as mc
                    where mc.dni_contacto = dc.dni and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
                    from ${PGSCHEMA}.dt_contactos as dc
                    where dc.dni = $1`
        let params = [dni_contact, datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}



//Ajax search DNI

function getPatientContactByDNI(dni_contact, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select p.dni,
                    case when c.edad is null then p.edad else c.edad end,
                    p.factor_riesgo,
                    1 as seguimiento,
                    p.nombre,
                    c.observacion,
                    '' as parentesco,
                    ($2::date - c.fecha_creacion::date + 1)::int as dia,
                    (select id_status from ${PGSCHEMA}.dt_monitoreo_contactos 
                        where dni_contacto = c.dni and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
                    from ${PGSCHEMA}.dt_pacientes as p
                    left join ${PGSCHEMA}.dt_contactos as c
                    on p.dni = c.dni
                    where p.dni = $1;`
        let params = [dni_contact, datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function getContactByDNI(dni_contact, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()

        let query = `select c.dni,
                c.edad,
                c.factor_riesgo,
                3 as seguimiento,
                c.nombre,
                c.observacion,
                '' as parentesco,
                ($2::date - fecha_creacion::date + 1) as dia,
                (select id_status from ${PGSCHEMA}.dt_monitoreo_contactos where dni_contacto = c.dni and fecha_monitoreo = $2::date limit 1)::char(1) as monitoreo
                from ${PGSCHEMA}.dt_contactos as c
                where c.dni = $1 limit 1;`
        let params = [dni_contact, datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}

function getMonitoreoContactsByDNI(dni_contact, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_init } = getTimeNow()
        if(!client)
            client = await openConnection()
        let query = `select (mc.fecha_monitoreo - c.fecha_creacion::date + 1) as dia, 
        mc.id_status as monitoreo  from ${PGSCHEMA}.dt_monitoreo_contactos as mc
        INNER join ${PGSCHEMA}.dt_contactos as c
        on mc.dni_contacto = c.dni
        where dni_contacto = $1 and fecha_monitoreo < $2::date;`
        let params = [dni_contact, datePeru_init]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result.rows, client})
    })
}


function removePermissionContact(dni_contact, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `update ${PGSCHEMA}.dt_contactos_pacientes set
                        flag = false where dni_contacto = $1;`
        let params = [dni_contact]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result, client})
    })
}

function addPermissionContact(dni_contact, dni_patient, pass = false,client = null){
    return new Promise(async (resolve, reject)=>{
        if(!client)
            client = await openConnection()
        let query = `update ${PGSCHEMA}.dt_contactos_pacientes set
                        flag = true where dni_contacto = $1 and dni_paciente = $2;`
        let params = [dni_contact, dni_patient]
        let result = await client.query(query, params)
        if(!pass)
            client.release(true)
        resolve({result : result, client})
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
    listContactByDNI,
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
    listContact,
    addPermissionContact,
    removePermissionContact
}