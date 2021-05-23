/* eslint max-len: ['error', {'code': 140}] */
const CronJob = require('cron').CronJob;
const migration = require('./model/migration');
const casePatientWithVaccineForm = require('./model/casePatientWithVaccineForm');
const movistar = require('./lib/movistar');
const {
  TIME_OUT_ROUTINE,
  TIME_OUT_ROUTINE_MIGRATE_VACCINE,
  TIME_OUT_ROUTINE_SMS_VACCINE,
  URL_BASE,
} = require('./config');

const job01 = new CronJob(TIME_OUT_ROUTINE, function() {
  migration.makeMigrations();
}, null, true, 'America/Lima');

const job02 = new CronJob(TIME_OUT_ROUTINE_MIGRATE_VACCINE, async function() {
  await migration.makeMigrationsPatientVaccineForm();
  await migration.makeMigrationsPatientsWithVaccine();
}, null, true, 'America/Lima');

const job03 = new CronJob(TIME_OUT_ROUTINE_SMS_VACCINE, async function() {
  sendSMSPatientWithVaccine();
}, null, true, 'America/Lima');

/**
 */
async function sendSMSPatientWithVaccine() {
  const formCases = await casePatientWithVaccineForm.getCasePatientWithVaccineFormPending();
  const listRecipent = await Promise.all(formCases.map((formCase)=>{
    return {
      'mobile': formCase.celular,
      'correlationLabel': 'Monitoreo de vacunas',
      'url': `${URL_BASE}/vacuna/encuesta/${formCase.documento_identidad}`,
    };
  }));
  console.log("Total de mensajes a enviar.");
  console.log(listRecipent.length)
  movistar.sendManySMS(listRecipent, ` ¡Hola! Te saludamos del Programa de Monitoreo post-vacunación contra COVID-19.
  Para completar el seguimiento de hoy, por favor ingresa al siguiente enlace:`);
}


/**
 * Ejecutar los jobs
 * @function
 */
function runJobs() {
  job01.start();
  job02.start();
  job03.start();
}

module.exports = {
  runJobs,
};
