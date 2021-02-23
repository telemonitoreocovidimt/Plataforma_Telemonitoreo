
/**
 * Generar un codigo de 6 números.
 * @return {Number} Número generado.
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

module.exports = {
  generateCode,
};
