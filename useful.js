
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

/**
 * @function
 * @param {Date} date - Fecha que se parsiara a formato YYYY-MM-DD HH:MM:SS
 * @returns {String} Fecha en formato YYYY-MM-DD HH:MM:SS
 */
function dateToTimeStampString(date){
    let timestamp_string = `${date.getFullYear().toString()}-${(date.getMonth() + 1).toString().padStart(2,"0")}-${date.getDate().toString().padStart(2,"0")} ${date.getHours().toString().padStart(2,"0")}:${date.getMinutes().toString().padStart(2,"0")}:${date.getSeconds().toString().padStart(2,"0")}`
    return timestamp_string
}

/**
 * Objecto para almacenar un rango de timestamp
 * @typedef TimeStampRange
 * @property {String} from - Fecha "Desde" en formato YYYY-MM-DDT00:00:00.000Z
 * @property {String} to - Fecha "Hasta" en formato YYYY-MM-DDT23:59:59.000Z
 */

/**
 * @function
 * @param {Date} from - Fecha "Desde" para generar rango en timestamp
 * @param {Date} to - Fecha "Hasta" para generar rango en timestamp
 * @returns {TimeStampRange} Fecha en formato YYYY-MM-DD HH:MM
 */
function dateRangeToTimeStanpStringRange(from, to){
    let from_string = dateToDateString(from)
    let to_string = dateToDateString(to)
    return {
        from: from_string + "T00:00:00.000Z",
        to: to_string + "T23:59:59.000Z"
    }
}

module.exports = {
    isValidDate,
    dateToDateString,
    dateToTimeStampString,
    dateRangeToTimeStanpStringRange
}