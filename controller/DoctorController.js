const DoctorModel = require('../model/DoctorModel');

module.exports = class DoctorController {


    static async getDoctorList(id_hospital) {
        return DoctorModel.getDoctorList(id_hospital);
    }

}