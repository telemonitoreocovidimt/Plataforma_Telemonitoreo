const {openConnection} = require('./connection');
const {PGSCHEMA} = require('./../config');

/**
 * Validar credenciales
 * @function
 * @param {String} email Correo electronico del usuario
 * @param {String} password Contraseña del usuario
 * @return {Promise}
 */
function login(email, password) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.dm_medicos_voluntarios as m 
                    where m.correo = $1 and m.password = $2`;
    const params = [email, password];
    console.log('Run query login');
    const result = await client.query(query, params);
    client.release(true);
    console.log('End query login');
    resolve(result.rows);
  });
}

/**
 * Validar credenciales
 * @function
 * @param {String} email Correo electronico del usuario
 * @param {String} password Contraseña del usuario
 * @return {Promise}
 */
function login(email, password) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select *, h.descripcion nombre_hospital
       from ${PGSCHEMA}.dm_medicos_voluntarios as m 
       inner join ${PGSCHEMA}.dm_hospitales as h
        on m.id_hospital = h.id
                    where m.correo = $1 and m.password = $2 limit 1;`;
    const params = [email, password];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * Validar credenciales para administrador
 * @function
 * @param {String} email Correo electronico del administrador
 * @param {String} password Contraseña del administrador
 * @return {Promise}
 */
function loginAdmin(email, password) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select *, h.descripcion nombre_hospital
        from ${PGSCHEMA}.dm_administradores as a
        inner join ${PGSCHEMA}.dm_hospitales as h
        on a.id_hospital = h.id
        where a.email = $1 
        and a.password = crypt($2, a.password) limit 1;`;
    const params = [email, password];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows);
  });
}

/**
 * Obtener paciente
 * @function
 * @param {String} dniPatient Dni de paciente
 * @return {Promise}
 */
function getPatient(dniPatient) {
  return new Promise(async (resolve, reject)=>{
    const client = await openConnection();
    const query = `select * from ${PGSCHEMA}.dt_pacientes
                    where dni = $1`;
    const params = [dniPatient];
    const result = await client.query(query, params);
    client.release(true);
    resolve(result.rows.length == 0? null : result.rows[0]);
  });
}

module.exports = {
  login,
  loginAdmin,
  getPatient,
};
