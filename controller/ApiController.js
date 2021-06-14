const apiModel = require('./../model/ApiModel');

exports.uploadVaccinatedPatients = async function (vaccinatedPatients) {
    return new Promise(async (resolve, reject)=> {
        apiModel.uploadVaccinatedPatients(vaccinatedPatients)
        .then(result => {
            resolve(result.rowCount);
        })
        .catch(async err =>{
            console.log(err);
            let errorMessage = err.detail;
            if (err.code == '23505') {
                const documentoIdentidadList = vaccinatedPatients.map((vaccinatedPatient)=>{
                    return vaccinatedPatient.documento_identidad;
                });
                const vaccinatedPatientsDuplicated = await apiModel.getVaccinatedPatients(documentoIdentidadList).catch(console.log);
                errorMessage = '';
                vaccinatedPatientsDuplicated.rows.forEach((row) => {
                    errorMessage += `El DNI ${row.documento_identidad} ya existe.<br/>`;
                });
                if (errorMessage == '') {
                    errorMessage = 'Posiblemente hay filas duplicadas.';
                }
            }
            reject(errorMessage)
        });
    });     
}