
/**
 * Validar si tiene el formato de un DNI.
 * @function
 * @param {String} DNI Texto que se validara.
 * @return {Boolean} Si es o no un DNI.
 */
function isDNI(DNI='') {
  const regex = new RegExp('^[0-9]{8}$');
  return regex.test(DNI);
}

module.exports = {
  isDNI,
};
