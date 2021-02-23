/* eslint "max-len" : ["error", {"code": 190}] */
const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');

/**
 * @param {*} from
 * @param {*} to
 * @return {Promise}
 */
function getRangeCase(from, to) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `SELECT p.dni "DNI paciente",
                  p.nombre "Nombre paciente",
                  p.celular "Celular paciente",
                  p.distrito "Distrito paciente",
                  CONCAT(mv.apellido,' ',mv.nombre) "Nombre medico",
                  cd.fecha_caso "Fecha del caso",
                  ep.descripcion "Bandeja",
                  cd.comentario "Comentarios",
                  case when cd.fiebre = 1 then 'SI' else 'NO' end "Fiebre",
                  case when cd.dificultad_respitar = 1 then 'SI' else 'NO' end "Dificultad para respirar",
                  case when cd.dolor_pecho = 1 then 'SI' else 'NO' end "Dolor de pecho",
                  case when cd.alteracion_sensorio = 1 then 'SI' else 'NO' end "Alteración del sensorio",
                  case when cd.colaboracion_azul_labios = 1 then 'SI' else 'NO' end "Colorazión azul en los labios",
                  case when cd.tos = 1 then 'SI' else 'NO' end "Tos",
                  case when cd.dolor_garganta = 1 then 'SI' else 'NO' end "Dolor de garganta",
                  case when cd.congestion_nasal = 1 then 'SI' else 'NO' end "Congestion nasal",
                  case when cd.malestar_general = 1 then 'SI' else 'NO' end "Malestar general",
                  case when cd.cefalea = 1 then 'SI' else 'NO' end "Cefalea",
                  case when cd.nauseas = 1 then 'SI' else 'NO' end "Nauseas",
                  case when cd.diarrea = 1 then 'SI' else 'NO' end "Diarre"
                  FROM ${PGSCHEMA}.dt_casos_dia cd
                  INNER JOIN ${PGSCHEMA}.dt_pacientes p ON cd.dni_paciente = p.dni
                  INNER JOIN ${PGSCHEMA}.dm_medicos_voluntarios mv ON cd.dni_medico = mv.dni
                  INNER JOIN ${PGSCHEMA}.dm_estados_pacientes ep ON ep.id = p.estado
                  WHERE cd.fecha_caso::date >= $1::date and cd.fecha_caso::date <= $2::date
                  ORDER BY cd.fecha_caso ASC`;
    const params = [from, to];
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
function getRangeDailySurvey(from, to) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select dni_paciente "DNI paciente",
                    nombre "Nombre",
                    max(fecha_respuesta) "Fin de encuesta",
                    max(dificultad_para_respirar) "Dificultad para respirar",
                    max(dolor_pecho) "Dolor de pecho",
                    max(confusion_desorientacion) "Confusion y desorientacion",
                    max(labios_azules) "Labios azules",
                    max(dolor_garganta) "Dolor de garganta",
                    max(tos) tos,max(desaparicion_olfato) "Desaparición del olfato",
                    max(fiebre_ayer) "Tubo fiebre ayer",
                    max(fiebre_hoy) "Tienes fiebre hoy",
                    max(diarrea) "Diarrea"
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
                    where r.fecha_respuesta::date >= $1::date and r.fecha_respuesta::date <= $2::date and
                    id_pregunta in ('dificultad_para_respirar','dolor_pecho','confusion_desorientacion','labios_azules',
                    'dolor_garganta','tos','desaparicion_olfato','fiebre_ayer','fiebre_hoy','diarrea')
                    order by p.dni asc
                    ) fex
                    group by dni_paciente, nombre
                    order by max(fecha_respuesta) asc`;
    const params = [from, to];
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
function getRangeInitialSurvey(from, to) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select dni_paciente "DNI paciente",
                nombre "Nombre",
                max(fecha_respuesta) "Fin de encuesta", 
                max(edad_paciente) "Edad paciente",
                max(es_profesional_salud) "Es profesional de la salud",
                max(contacto_14_confirmado) "Contacto con personas confirmada",
                max(contacto_14_sospecha) "Contacto con personas sospechosa",
                max(contacto_14_pendiente) "Contacto con personas pendiente",
                max(comorbilidades) "comorbilidades",
                max(num_personas_domicilio) "#Personas domicilio",
                max(comorbilidades_familiares) "Comorbilidades familiares"
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
                where r.fecha_respuesta::date >= $1::date and r.fecha_respuesta::date <= $2::date and
                id_pregunta in ('edad_paciente','es_profesional_salud','contacto_14_confirmado','contacto_14_sospecha',
                'contacto_14_pendiente','comorbilidades','num_personas_domicilio','comorbilidades_familiares')
                order by p.dni asc
                ) fex
                group by dni_paciente,nombre
                order by max(fecha_respuesta) asc`;
    const params = [from, to];
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
function getPatientsVaccine() {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select documento_identidad,
              tipo_documento,
              nombre,
              cargo,
              condicion,
              hospital,
              nota_grupo,
              estado,
              email,
              celular,
              fecha_creacion::text fecha_creacion,
              trabajo_presencial,
              celular_validado,
              fecha_validacion::text fecha_validacion,
              fecha_ultima_modificacion::text fecha_ultima_modificacion,
              puntuacion,
              id_hospital,
              fecha_respuesta_registro::text fecha_respuesta_registro
    from ${PGSCHEMA}.dt_pacientes_vacuna
    where celular_validado > 0;`;
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
function getPatientsTrayVaccine() {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select  cvf.id, pv.nombre, cvf.documento_identidad_paciente_vacuna as documento_identidad,
    pv.celular,
    cvf.fecha_creacion::text as fecha_creacion,
    cvf.piel,
    cvf.dolor,
    cvf.fiebre,
    cvf.cabeza,
    cvf.confusion,
    cvf.adormecimiento,
    cvf.diarrea,
    cvf.otros,
    cvf.fecha_respondido::text as fecha_respondido,
    cvf.estado,
    cvf.puntuacion
    from ${PGSCHEMA}.dt_casos_vacuna_form as cvf
inner join ${PGSCHEMA}.dt_pacientes_vacuna as pv
on cvf.documento_identidad_paciente_vacuna = pv.documento_identidad;`;
    const params = [];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

module.exports = {
  getRangeCase,
  getRangeInitialSurvey,
  getRangeDailySurvey,
  getPatientsTrayVaccine,
  getPatientsVaccine,
};
