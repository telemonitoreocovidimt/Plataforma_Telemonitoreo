const PatientModel = require('./../model/PatientModel');

module.exports = class PatientController {


    static async searchPatient(query, id_hospital) {
        return PatientModel.searchPatient(query, id_hospital);
    }

    static async update(patientId, data) {
        return PatientModel.update(patientId, data);
    }

}