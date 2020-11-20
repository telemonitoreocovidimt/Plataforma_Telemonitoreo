

function isDNI(_dni=""){
    let regex = new RegExp("^[0-9]{8}$")
    return regex.test(_dni)
}



module.exports = {
    isDNI
}