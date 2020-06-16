
/**
 * @function
 * @param {String} value - Validación cutomizable para validar el tipo de fecha, utilizable para express-validator.
 * @returns {Boolean} Si todo sale bien y se cumple la validación devolvera "TRUE", si no lanzara un error.
 */
function isValidDate(value) {
    if (!value.match(/^\d{4}-\d{2}-\d{2}$/)){
        throw new Error()
    }
    else{
        const date = new Date(value);
        if (!date.getTime())
            throw new Error()
        return date.toISOString().slice(0, 10) === value;
    }
}


/**
 * @function
 * @param {Date} date - Fecha que se parsiara a formato YYYY-MM-DD
 * @returns {String} Fecha en formato YYYY-MM-DD
 */
function dateToDateString(date){
    let date_string = `${date.getFullYear().toString()}-${(date.getMonth() + 1).toString().padStart(2,"0")}-${date.getDate().toString().padStart(2,"0")}`
    return date_string
}

module.exports = {
    isValidDate,
    dateToDateString,
}