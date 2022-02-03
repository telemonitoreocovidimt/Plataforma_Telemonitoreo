const {openConnection} = require('./connection');
const {PGSCHEMA} = require('../config');
const Parser = require('./../lib/parser');
const { getTimeNow } = require('../lib/time');

module.exports = class CaseModel {



    /**
     * Actualizar caso
     * @param {Number} caseId id del caso que se actualizara
     * @param {JSON} data campo para actualizar
     * @return {Number} Cantidad de registros afectados.
     */
    static async update(caseId, data) {
        return new Promise(async (resolve, reject)=>{
            const client = await openConnection();
            const q = `update ${PGSCHEMA}.dt_casos_dia set
                        ${Parser.toSQLParameters(data)}
                        where id = $1;`;
            const params = [caseId];
            const result = await client.query(q, params);
            client.release(true);
            console.log("Update Case");
            console.log(result);
            resolve(result.rowCount);
        });
    }

    static attendanceStatisticsToDay() {
        return new Promise(async function(resolve, reject) {
            const todayDate = getTimeNow();
            const yesterdayDate = getTimeNow(30);
            const client = await openConnection();
            const q = `
                select
                    rsf.dni,
                    mvf.nickname,
                    count(rsf.dni_paciente) as caseTaked,
                    sum(rsf.in_traking) as inTraking
                from (
                
                        select
                            rs.dni,
                            rs.dni_paciente,
                            (case
                                when rs.times_taken_before = 0 then 0
                                else 1
                            end) as in_traking
                        from (
                            select mv.dni, cd.dni_paciente, 
                                coalesce((select count(*) from production.dt_casos_dia as cdl
                                where cdl.dni_paciente = cd.dni_paciente
                                and cdl.dni_medico = mv.dni
                                and cdl.fecha_caso < $1
                                and cdl.fecha_caso >= $2
                                group by cdl.dni_paciente), 0) as times_taken_before  
                            from production.dm_medicos_voluntarios as mv
                            left join production.dt_casos_dia as cd
                            on mv.dni = cd.dni_medico
                            where cd.fecha_caso = $1
                        ) as rs
                ) as rsf
                inner join production.dm_medicos_voluntarios as mvf
                on rsf.dni = mvf.dni
                group by rsf.dni, mvf.nickname;
            `;
            const params = [todayDate.peruvianDateInit, yesterdayDate.peruvianDateInit];
            const result = await client.query(q, params);
            client.release(true);
            resolve(result.rows);
        });
    }
    

}