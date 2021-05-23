/* eslint "max-len": ["error", {"code":200}] */
const pgFormat = require('pg-format');
const { openConnection } = require('./connection');
const { PGSCHEMA } = require('../config');
const time = require('./../lib/time');


exports.uploadVaccinatedPatients = function (vaccinatedPatients) {
    return new Promise(async (resolve, reject)=> {
        const {peruvianDateCurrent} = time.getTimeNow();
        const inserts = [];
        vaccinatedPatients.forEach(vaccinatedPatient => {
            const params = [
                vaccinatedPatient.documento_identidad,
                vaccinatedPatient.tipo_documento,
                vaccinatedPatient.nombre,
                vaccinatedPatient.cargo,
                vaccinatedPatient.condicion,
                'HCH Enfermedades de fondo',
                5,
                vaccinatedPatient.celular,
                0,
                2,
                3,
                vaccinatedPatient.sexo,
                vaccinatedPatient.direccion,
                vaccinatedPatient.distrito,
                vaccinatedPatient.provincia,
                vaccinatedPatient.departamento,
                vaccinatedPatient.seguro,
                peruvianDateCurrent,
                peruvianDateCurrent,
                peruvianDateCurrent,
                peruvianDateCurrent,
            ];
            inserts.push(params);
        })
        const client = await openConnection();
        const query = pgFormat(`
            INSERT INTO ${PGSCHEMA}.dt_pacientes_vacuna (
                documento_identidad,
                tipo_documento,
                nombre,
                cargo,
                condicion,
                hospital,
                estado,
                celular,
                trabajo_presencial,
                celular_validado,
                id_hospital,
                sexo,
                direccion,
                distrito,
                provincia,
                departamento,
                seguro,
                fecha_creacion,
                fecha_validacion,
                fecha_ultima_modificacion,
                fecha_respuesta_registro
            ) VALUES %L;
        `, inserts);
        client.query(query, []).then(result => {
            client.release(true);
            resolve(result);
        }).catch(async (err) => {
            client.release(false);
            reject(err);
        });
    });
}

exports.getVaccinatedPatients = async function (documentoIdentidadList) {
    const client = await openConnection();
    const queryDuplicate = pgFormat(`
        select * from ${PGSCHEMA}.dt_pacientes_vacuna
        where documento_identidad in (%L);
    `, documentoIdentidadList);
    const patients = await client.query(queryDuplicate, []);
    client.release(true);
    return patients
}