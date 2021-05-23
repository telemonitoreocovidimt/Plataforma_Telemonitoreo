const apiModel = require('./../model/ApiModel');

exports.uploadVaccinatedPatients = async function (vaccinatedPatients) {
    return new Promise(async (resolve, reject)=> {
        apiModel.uploadVaccinatedPatients(vaccinatedPatients)
        .then(result => {
            console.log(result);
            resolve(result.rowCount);
        })
        .catch(async err =>{
            let errorMessage = err.detail;
            if (err.code == '23505') {
                const documentoIdentidadList = vaccinatedPatients.map((vaccinatedPatient)=>{
                    return vaccinatedPatient.documento_identidad;
                });
                const vaccinatedPatientsDuplicated = await apiModel.getVaccinatedPatients(documentoIdentidadList);
                errorMessage = '';
                vaccinatedPatientsDuplicated.rows.forEach((row) => {
                    errorMessage += `El DNI ${row.documento_identidad} ya existe.<br/>`;
                });
            }
            reject(errorMessage)
        });
    });     
}