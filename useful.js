
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

function getGroups(data, lastdata=[]){

    const els_drop = {
    }
    
    const els_update = {
    }
    
    const others = {
    }
    
    for(let x in data){
        let e = x.split("tra_")
        if(e.length > 1){
            e = e[1]
            e = e.split("_")
            let j = e[0].split("none")
            if(j.length > 1){
                if(!others[j[1]])
                    others[j[1]] = {}
               others[j[1]][e[1]] = data[x] == "" ? null:data[x]
            }
            else{
                if(!els_drop[e[0]])
                    els_drop[e[0]] = {}
               els_drop[e[0]][e[1]] = data[x] == "" ? null:data[x]
            }
        }
    }

    for(let item of lastdata){

        if(els_drop[item.id]){
            els_update[item.id] = els_drop[item.id]
            delete els_drop[item.id]
        }
        else{
            els_drop[item.id] = item
        }
    }

    const for_drop = jsonToArray(els_drop)
    const for_add = jsonToArray(others)
    const for_update = jsonToArray(els_update)
    console.log("Elementos para eliminar: ", for_drop)
    console.log("Elementos para agregar: ", for_add)
    console.log("Elementos para actualizar : ", for_update)

    return {
        for_drop,
        for_add,
        for_update
    }
}

function jsonToArray(json){
    let array = []
    for(let key in json){
        array.push(json[key])
    }
    return array
}

function getGroupsContacts(data, lastdata=[]){

    const els_drop = {
    }
    
    const els_update = {
    }
    
    const others = {
    }
    
    // const array_insert = []
    // const array_update = []
    // const array_delete = []
    
    for(let x in data){
        let e = x.split("cont_")
        if(e.length > 1){
            e = e[1]
            e = e.split("_")
            let j = e[0].split("none")
            if(j.length > 1){
                if(!others[j[1]])
                    others[j[1]] = {}
               others[j[1]][e[1]] = data[x]
            }
            else{
                if(!els_drop[e[0]])
                    els_drop[e[0]] = {}
               els_drop[e[0]][e[1]] = data[x]
            }
        }
    }
    

    for(let item of lastdata){

        if(els_drop[item.dni]){
            els_update[item.dni] = els_drop[item.dni]
            delete els_drop[item.dni]
        }
        else{
            els_drop[item.dni] = item
        }

    }

    const for_drop = jsonToArray(els_drop)
    const for_add = jsonToArray(others)
    const for_update = jsonToArray(els_update)
    console.log("Elementos para eliminar: ", for_drop)
    console.log("Elementos para agregar: ", for_add)
    console.log("Elementos para actualizar : ", for_update)

    return {
        for_drop,
        for_add,
        for_update
    }
}

module.exports = {
    isValidDate,
    dateToDateString,
    dateToTimeStampString,
    dateRangeToTimeStanpStringRange,
    getGroups,
    getGroupsContacts
}