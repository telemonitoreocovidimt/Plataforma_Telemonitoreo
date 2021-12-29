
/* eslint 'max-len': ['error', {'code':250}] */
const ParameterModel = require('./../model/ParameterModel');


module.exports = class ParameterController {

    static async getParameter(parameterName) {
        const result = await ParameterModel.getParameter([parameterName]);
        if (result.rowCount === 0 || !result.rows[0].hasOwnProperty(parameterName)) {
            return null;
        }
        return result.rows[0][parameterName];
    }
}