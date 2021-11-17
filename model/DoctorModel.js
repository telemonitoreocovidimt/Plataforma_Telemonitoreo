const {openConnection} = require('./connection');
const {PGSCHEMA} = require('../config');

module.exports = class DoctorModel {



        /**
     * Listar todos los medicos voluntarios por hospital
     * @param {String} query parte dek nombre o documento del paciente
     * @param {Number} id_hospital ID del hospital para filtrar pacieentes.
     * @return {JSON} Json con los dni y nombres de  los medicos voluntarios.
     */
    static async getDoctorList(id_hospital) {
        return new Promise(async (resolve, reject)=>{
            const client = await openConnection();
            const query = `select mv.dni, concat(mv.nombre, ' ', mv.apellido) as name from ${PGSCHEMA}.dm_medicos_voluntarios as mv
                        where mv.id_hospital = $1;`;
            const params = [id_hospital];
            const result = await client.query(query, params);
            client.release(true);
            resolve(result.rows);
        });
    }
    

}