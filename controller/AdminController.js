const AdminModel = require('../model/AdminModel');

exports.sentToDashboard = async function (documentNumberList) {
    return AdminModel.sentToDashboard(documentNumberList); 
}

exports.updateGroupNote = function (documentNumberList, comment) {
    return AdminModel.updateGroupNote(documentNumberList, comment); 
}

exports.forceSentToDashboard = function (documentNumberList) {
    return AdminModel.forceSentToDashboard(documentNumberList);
}