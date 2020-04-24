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

function makeMigrations(){
    return new Promise(async (resolve, reject)=>{
        let { datePeru_current } = getTimeNow()
        let client = await openConnection()
        let query = `update development.dt_casos_dia set estado_caso = 4
                        where estado_caso in (1, 2);`
        let params = []
        let result = await client.query(query, params)
        query = `INSERT INTO development.dt_casos_dia(dni_paciente,estado_caso,fiebre,dificultad_respitar,dolor_pecho,
                    alteracion_sensorio,colaboracion_azul_labios,tos,dolor_garganta,congestion_nasal,malestar_general,cefalea,
                    nauseas,diarrea,comentario,fecha_caso)
                    SELECT p.dni, 1, 0,0,0,0,0,0,0,0,0,0,0,0,'', $1 FROM development.dt_pacientes p
                    where p.estado in (2, 3) and paso_encuesta_inicial = true and not p.grupo = 'A';`
        params = [datePeru_current]
        result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}


module.exports = {
    makeMigrations
}