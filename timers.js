//Import modules
const CronJob = require("cron").CronJob;

//Global variables
const { TIME_OUT_ROUTINE } = require("./config")

//Import my modules

const { makeMigrations } = require("./model/migration")


//Config Timers
const job_01 = new CronJob(TIME_OUT_ROUTINE, function() {
    makeMigrations()
}, null, true, "America/Lima")


function runJobs(){
    job_01.start()
}

module.exports = {runJobs}