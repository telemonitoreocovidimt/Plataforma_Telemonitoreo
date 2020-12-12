const CronJob = require('cron').CronJob;

const {TIME_OUT_ROUTINE} = require('./config');
const {makeMigrations} = require('./model/migration');

const job01 = new CronJob(TIME_OUT_ROUTINE, function() {
  makeMigrations();
}, null, true, 'America/Lima');

/**
 * Ejecutar los jobs
 * @function
 */
function runJobs() {
  job01.start();
}

module.exports = {
  runJobs,
};
