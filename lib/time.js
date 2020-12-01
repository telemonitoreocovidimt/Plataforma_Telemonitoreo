const moment = require('moment-timezone');

/**
 * Obtener la hora actual en Lima y con posibilidad
 * a sobre esa hora aumentar o disminuir horas y dias.
 * @function
 * @param {Number} restarDay cantidad para restar dias.
 * @param {Number} restarHour catidad para restar horas.
 * @return {JSON} Json que contienen
 * la Hora del momento, la hora final y inicial del dia.
 */
function getTimeNow(restarDay = 0, restarHour = 0) {
  const date = new Date();
  date.setDate(date.getDate() - restarDay);
  date.setHours(date.getHours() - restarHour);
  const peruvianDate = moment.tz(date, 'America/Lima');
  const peruvianDateString = `${peruvianDate.year()
      .toString()}-${(peruvianDate.month() + 1).toString()
      .padStart(2, '0')}-${peruvianDate.date().toString().padStart(2, '0')}`;
  const peruvianDateInit = `${peruvianDateString}T00:00:00.000Z`;
  const peruvianDateFinish = `${peruvianDateString}T23:59:59.0000Z`;
  const peruvianTimeString = `${peruvianDate
      .hours()
      .toString()
      .padStart(2, '0')}:${peruvianDate
      .minutes()
      .toString()
      .padStart(2, '0')}:${peruvianDate
      .seconds()
      .toString()
      .padStart(2, '0')}.${peruvianDate.milliseconds()
      .toString().padStart(3, '0')}Z`;
  const peruvianDateCurrent = `${peruvianDateString}T${peruvianTimeString}`;
  return {peruvianDateInit, peruvianDateFinish, peruvianDateCurrent};
}

module.exports = {
  getTimeNow,
};
