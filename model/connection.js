const {Pool} = require('pg');

const pool = new Pool({
  ssl: true,
});
/**
 * @return {Pool}
 */
function openConnection() {
  return pool.connect();
}

module.exports = {
  openConnection,
  pool,
};
