const { openConnection } = require("./connection")


function login(email, password){
    return new Promise(async (resolve, reject)=>{
        let client = await openConnection()
        let query = "select * from development.dm_medicos_voluntarios as m where m.correo = $1 and m.password = $2"
        let params = [email, password]
        let result = await client.query(query, params)
        client.release(true)
        resolve(result.rows)
    })
}

module.exports = {
    login
}


