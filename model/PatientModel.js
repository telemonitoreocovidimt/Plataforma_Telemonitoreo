const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');
const Parser = require('./../lib/parser');

module.exports = class PatientModel {



        /**
     * Buscar información de un paciente si tiene caso creado.
     * @param {String} query parte dek nombre o documento del paciente.
     * @param {Number} id_hospital ID del hospital para filtrar pacieentes.
     * @return {JSON} Json con los datos del paciente.
     */
    static async searchPatient(query, id_hospital) {
        return new Promise(async (resolve, reject)=>{
            const client = await openConnection();
            const q = `select * from ${PGSCHEMA}.dt_pacientes as p
                            inner join ${PGSCHEMA}.dm_estados_pacientes as ep
                            on p.estado = ep.id
                            left join (select * from production.dt_casos_dia
                                where fecha_caso = (now() AT TIME ZONE 'America/Lima')::date) as cd
                            on p.dni = cd.dni_paciente
                            where p.id_hospital = $1
                            and (
                                p.nombre ilike '%${query}%'
                                or p.dni ilike '%${query}%'
                            );`;
            const params = [id_hospital];
            const result = await client.query(q, params);
            client.release(true);
            resolve(result.rows);
        });
    }


    /**
     * Actualizar paciente
     * @param {Number} patientId id del paciente
     * @param {JSON} data campo para actualizar
     * @return {Number} Cantidad de registros afectados.
     */
     static async update(patientId, data) {
        return new Promise(async (resolve, reject)=>{
            const client = await openConnection();
            const q = `update ${PGSCHEMA}.dt_pacientes set
                        ${Parser.toSQLParameters(data)}
                        where dni = $1;`;
            console.log(q);
            const params = [patientId];
            const result = await client.query(q, params);
            client.release(true);
            console.log("Update Patient");
            console.log(result);
            resolve(result.rowCount);
        });
    }
    

}