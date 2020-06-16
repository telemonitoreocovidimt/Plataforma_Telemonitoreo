const { openConnection } = require("./connection")
const { PGSCHEMA } = require("./../config")

function getRangeCase(from , to){
    return new Promise(async (resolve, reject)=>{

        let client = await openConnection()
        let query = `SELECT p.dni,p.nombre,p.celular,p.distrito,
                CONCAT(mv.apellido,' ',mv.nombre),
                cd.fecha_caso,ep.descripcion,cd.comentario,
                cd.fiebre,cd.dificultad_respitar,cd.dolor_pecho,cd.alteracion_sensorio,cd.colaboracion_azul_labios,
                cd.tos,cd.dolor_garganta,cd.congestion_nasal,cd.malestar_general,cd.cefalea,cd.nauseas,cd.diarrea
                FROM ${PGSCHEMA}.dt_casos_dia cd
                INNER JOIN ${PGSCHEMA}.dt_pacientes p ON cd.dni_paciente = p.dni
                INNER JOIN ${PGSCHEMA}.dm_medicos_voluntarios mv ON cd.dni_medico = mv.dni
                INNER JOIN ${PGSCHEMA}.dm_estados_pacientes ep ON ep.id = p.estado
                WHERE cd.fecha_caso > $1 and cd.fecha_caso < $2
                ORDER BY cd.fecha_caso ASC`
        let params = [from, to]
        let result = await client.query(query, params)
        resolve(result.rows)
    })
}

function getRangeDailySurvey(from , to){
    return new Promise(async (resolve, reject)=>{

        let client = await openConnection()
        let query = `select dni_paciente,nombre,max(fecha_respuesta), max(dificultad_para_respirar) dificultad_para_respirar,
                    max(dolor_pecho) dolor_pecho,max(confusion_desorientacion) confusion_desorientacion,max(labios_azules) labios_azules,
                    max(dolor_garganta) dolor_garganta,max(tos) tos,max(desaparicion_olfato) desaparicion_olfato,
                    max(fiebre_ayer) fiebre_ayer,max(fiebre_hoy) fiebre_hoy,max(diarrea) diarrea
                    from
                    (select dni_paciente,nombre,fecha_respuesta
                    ,case id_pregunta when 'dificultad_para_respirar' then respuesta_string else null end as dificultad_para_respirar
                    ,case id_pregunta when 'dolor_pecho' then respuesta_string else null end as dolor_pecho
                    ,case id_pregunta when 'confusion_desorientacion' then respuesta_string else null end as confusion_desorientacion
                    ,case id_pregunta when 'labios_azules' then respuesta_string else null end as labios_azules
                    ,case id_pregunta when 'dolor_garganta' then respuesta_string else null end as dolor_garganta
                    ,case id_pregunta when 'tos' then respuesta_string else null end as tos
                    ,case id_pregunta when 'desaparicion_olfato' then respuesta_string else null end as desaparicion_olfato
                    ,case id_pregunta when 'fiebre_ayer' then respuesta_string else null end as fiebre_ayer
                    ,case id_pregunta when 'fiebre_hoy' then respuesta_string else null end as fiebre_hoy
                    ,case id_pregunta when 'diarrea' then respuesta_string else null end as diarrea
                    from ${PGSCHEMA}.dt_respuestas r
                    inner join ${PGSCHEMA}.dt_pacientes p on p.dni = r.dni_paciente
                    where r.fecha_respuesta > $1 and r.fecha_respuesta < $2 and
                    id_pregunta in ('dificultad_para_respirar','dolor_pecho','confusion_desorientacion','labios_azules',
                    'dolor_garganta','tos','desaparicion_olfato','fiebre_ayer','fiebre_hoy','diarrea')
                    order by p.dni asc
                    ) fex
                    group by dni_paciente,nombre
                    order by max(fecha_respuesta) asc`
        let params = [from, to]
        let result = await client.query(query, params)
        resolve(result.rows)
    })
}

function getRangeInitialSurvey(from , to){
    return new Promise(async (resolve, reject)=>{

        let client = await openConnection()
        let query = `select dni_paciente,nombre,max(fecha_respuesta), max(edad_paciente) edad_paciente,
                max(es_profesional_salud) es_profesional_salud,
                max(contacto_14_confirmado) contacto_14_confirmado,max(contacto_14_sospecha) contacto_14_sospecha,
                max(contacto_14_pendiente) contacto_14_pendiente,max(comorbilidades) comorbilidades,
                max(num_personas_domicilio) num_personas_domicilio,max(comorbilidades_familiares) comorbilidades_familiares
                from
                (select dni_paciente,nombre,fecha_respuesta
                ,case id_pregunta when 'edad_paciente' then respuesta_string else null end as edad_paciente
                ,case id_pregunta when 'es_profesional_salud' then respuesta_string else null end as es_profesional_salud
                ,case id_pregunta when 'contacto_14_confirmado' then respuesta_string else null end as contacto_14_confirmado
                ,case id_pregunta when 'contacto_14_sospecha' then respuesta_string else null end as contacto_14_sospecha
                ,case id_pregunta when 'contacto_14_pendiente' then respuesta_string else null end as contacto_14_pendiente
                ,case id_pregunta when 'comorbilidades' then respuesta_string else null end as comorbilidades
                ,case id_pregunta when 'num_personas_domicilio' then respuesta_string else null end as num_personas_domicilio
                ,case id_pregunta when 'comorbilidades_familiares' then respuesta_string else null end as comorbilidades_familiares
                from ${PGSCHEMA}.dt_respuestas r
                inner join ${PGSCHEMA}.dt_pacientes p on p.dni = r.dni_paciente
                where r.fecha_respuesta > $1 and r.fecha_respuesta < $2 and
                id_pregunta in ('edad_paciente','es_profesional_salud','contacto_14_confirmado','contacto_14_sospecha',
                'contacto_14_pendiente','comorbilidades','num_personas_domicilio','comorbilidades_familiares')
                order by p.dni asc
                ) fex
                group by dni_paciente,nombre
                order by max(fecha_respuesta) asc`
        let params = [from, to]
        let result = await client.query(query, params)
        resolve(result.rows)
    })
}


module.exports = {
    getRangeCase,
    getRangeInitialSurvey,
    getRangeDailySurvey
}