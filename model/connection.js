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


async function executeSelect(query, parameters) {
  const client = await openConnection();
  const result = await client.query(query, parameters);
  client.release(true);
  return result;
}

module.exports = {
  openConnection,
  pool,
  executeSelect,
};
