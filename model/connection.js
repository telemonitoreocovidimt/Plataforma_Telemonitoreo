const {Pool, Client} = require("pg")
const pool = new Pool({
    ssl:true
})
function openConnection(){
    return pool.connect()
}
module.exports = {
    openConnection
}