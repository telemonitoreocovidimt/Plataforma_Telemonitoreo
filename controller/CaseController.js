const CaseModel= require('../model/CaseModel');

module.exports = class CaseController {

    static async update(caseId, data) {
        return CaseModel.update(caseId, data);
    }

}