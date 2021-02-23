
/**
 * Validar si tiene el formato de un DNI.
 * @function
 * @param {String} dni Texto que se validara.
 * @return {Boolean} Si es o no un DNI.
 */
function isDNI(dni) {
  const regex = new RegExp('^[0-9]{8}$');
  return regex.test(dni);
}

/**
 * Validar si tiene solo contiene números.
 * @function
 * @param {String} text Texto que se validara.
 * @return {Boolean} Si es o no un DNI.
 */
function hasOnlyNumbers(text) {
  const regex = new RegExp('^[0-9]*$');
  return regex.test(text);
}

/**
 * @function
 * @param {String} ce Valor que se validara si es un CE.
 * @return {Boolean} Verdadero si es un CE.
 */
function isCE(ce) {
  const regex = new RegExp('^[0-9]{9}$');
  return regex.test(ce);
}


/**
 * @function
 * @param {String} value Valor que se validara si es un DNI.
 * @return {Boolean} Verdadero si es un DNI.
 */
function isDNINotRequire(value) {
  if (value == '' || value == null) {
    return true;
  }
  return value.match(/^\d{8}$/);
}



/**
 * @function
 * @param {String} value Valor que se validara si es un CE.
 * @return {Boolean} Verdadero si es un CE.
 */
function isCENotRequired(value) {
  if (value == '' || value == null) {
    return true;
  }
  return value.match(/^\d{9}$/);
}

/**
 * @function
 * @param {String} value Valor que se validara si es un PHONE.
 * @return {Boolean} Verdadero si es un PHONE.
 */
function isPhone(value) {
  return value.match(/^\d{9}$/);
}

/**
 * @function
 * @param {String} value Valor que se validara si es un CODE.
 * @return {Boolean} Verdadero si es un CODE.
 */
function isCode(value) {
  return value.match(/^\d{6}$/);
}

/**
 * @function
 * @param {String} value Valor que se validara si es un EMAIL.
 * @return {Boolean} Verdadero si es un EMAIL.
 */
function isEmail(value) {
  return value.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
}

/**
 * @function
 * @param {String} value Valor que se validara si es un EMAIL.
 * @return {Boolean} Verdadero si es un EMAIL.
 */
function isEmailNotRequired(value) {
  if (value == '' || value == null) {
    return true;
  }
  return isEmail(value);
}

module.exports = {
  isDNI,
  isCE,
  hasOnlyNumbers,
  isPhone,
  isEmail,
  isEmailNotRequired,
  isDNINotRequire,
  isCENotRequired,
  isCode,
};
