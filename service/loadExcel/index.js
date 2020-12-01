const excelToJson = require('convert-excel-to-json');
const {getTimeNow} = require('../../lib/time');
const {
  addPatientAdmission,
  addPatientTamizaje,
  addHistory,
} = require('../../model/loadExcel');

/**
 * Leer un archivo Excel y agregar a la base de datos como recien admitidos.
 * @function
 * @param {String} excelPath Path del archivo excel.
 * @param {Number} idHospital Id del hospital para agregar los registros.
 * @return {Promise} HTML como mensaje informativo.
 */
function excelAdmision(excelPath, idHospital) {
  return new Promise(async (resolve, reject) => {
    const result = excelToJson({
      sourceFile: excelPath,
      header: {
        rows: 1,
      },
      columnToKey: {
        A: 'numero',
        B: 'fecha',
        C: 'apellidoPaterno',
        D: 'apellidoMaterno',
        E: 'nombre',
        F: 'documento',
        G: 'direccion',
        H: 'celular',
        I: 'fijo',
      },
    });
    const rows = result[Object.keys(result)[0]];
    const error = validateAdmision(rows);
    console.log(error);
    if (error.length !== 0) {
      return reject(error);
    }
    const {peruvianDateCurrent} = getTimeNow();
    await Promise.all(rows.map(async (row, i)=>{
      console.log(row);
      const rowNumber = i + 2;
      const params = [];
      params.push(numeroDocumento(row.documento));
      params.push(row.numero);
      params.push(concatApellidosNombrePG(
          row.apellidoPaterno, row.apellidoMaterno, row.nombre));
      params.push(row.fecha);
      params.push(peruvianDateCurrent);
      params.push(row.direccion);
      params.push(row.celular);
      params.push(row.fijo);
      await addPatientAdmission(
          params[0],
          params[1],
          params[2],
          params[3],
          params[4],
          params[5],
          params[6],
          params[7],
          idHospital,
      ).catch((error) => {
        error.push('No se pudo ingresar en la BD la fila ' + rowNumber);
      });
    }));
    if (error.length !== 0) {
      return reject(error);
    }
    return resolve('La Carga fue exitosa.');
  });
}

/**
 * Validar si existen todas las columnas y tengan los tipos
 * de datos correspondientes (requetidos, fechas y patrones)para admisión.
 * @function
 * @param {Array} rows Array multidimencional con los datos.
 * @return {Array} Lista de errores de columnas faltantes.
 */
function validateAdmision(rows) {
  const error = [];
  rows.forEach((row, i) => {
    const rowNumber = i + 2;
    isRequired(row.numero, 'A', rowNumber, error);
    isRequired(row.fecha, 'B', rowNumber, error);
    isRequired(row.apellidoPaterno, 'C', rowNumber, error);
    isRequired(row.apellidoMaterno, 'D', rowNumber, error);
    isRequired(row.nombre, 'E', rowNumber, error);
    isRequired(row.documento, 'F', rowNumber, error);
    isRequired(row.celular, 'H', rowNumber, error);
    isDate(row.fecha, 'B', rowNumber, error);
    parsePhoneNumber(row.celular, 'G', rowNumber, error);
  });
  return error;
}

/**
 * Leer un archivo Excel y agregar a la base de datos
 * a los usuarios como tamizaje.
 * @function
 * @param {String} excelPath Path del archivo excel.
 * @param {Number} idHospital Id del hospital para agregar los registros.
 * @return {Promise} HTML como mensaje informativo.
 */
function excelTamizaje(excelPath, idHospital) {
  return new Promise(async (resolve, reject) => {
    const result = excelToJson({
      sourceFile: excelPath,
      header: {
        rows: 1,
      },
      columnToKey: {
        A: 'numero',
        B: 'semanaEpid',
        C: 'fecha',
        D: 'documento',
        E: 'nombre',
        F: 'edad',
        G: 'sexo',
        H: 'celular',
        I: 'pais',
        J: 'provincia',
        K: 'distrito',
        L: 'direccion',
        M: 'fechaSintomas',
        N: 'fechaMuestra',
        O: 'tipoMuestra1',
        P: 'resultadoMuestra1',
        Q: 'fechaResultado1',
        R: 'tipoMuestra2',
        S: 'resultadoMuestra2',
        T: 'fechaResultado2',
        U: 'tipoMuestra3',
        V: 'resultadoMuestra3',
        W: 'fechaResultado3',
        X: 'destino',
        Y: 'lugar',
        Z: 'clasificacion',
        AA: 'evolucion1',
        AB: 'evolucion2',
      },
    });
    const rows = result[Object.keys(result)[0]];
    const error = validateTamizaje(rows);
    if (error.length !== 0) {
      return reject(error);
    }
    const {peruvianDateCurrent} = getTimeNow();
    await Promise.all(rows.map(async (row, i)=>{
      const rowNumber = i + 2;
      const paramsPatient = [];
      const paramsHistory = [];
      paramsPatient.push(numeroDocumento(row.documento));
      paramsPatient.push(row.numero);
      paramsPatient.push(row.nombre);
      paramsPatient.push(row.fecha);
      paramsPatient.push(peruvianDateCurrent);
      paramsPatient.push(row.direccion);
      paramsPatient.push(row.celular);
      paramsPatient.push(null);
      paramsPatient.push(row.fechaMuestra);
      paramsPatient.push(resultadoMuestra(row.resultadoMuestra1));
      paramsPatient.push(
        row.fechaResultado1 == undefined ? null : row.fechaResultado1);
      paramsPatient.push(tipoPrueba(row.tipoMuestra1));
      paramsPatient.push(resultadoMuestra(row.resultadoMuestra2));
      paramsPatient.push(
        row.fechaResultado2 == undefined ? null : row.fechaResultado2);
      paramsPatient.push(tipoPrueba(row.tipoMuestra2));
      paramsPatient.push(resultadoMuestra(row.resultadoMuestra3));
      paramsPatient.push(
        row.fechaResultado3 == undefined ? null : row.fechaResultado3);
      paramsPatient.push(tipoPrueba(row.tipoMuestra3));
      paramsPatient.push(row.sexo);
      paramsPatient.push(row.pais);
      paramsPatient.push(row.provincia);
      paramsPatient.push(row.distrito);
      paramsPatient.push(row.fechaSintomas);
      paramsPatient.push(confirmacionCovid19(row.clasificacion));
      paramsPatient.push(idHospital);
      paramsHistory.push(numeroDocumento(row.documento));
      paramsHistory.push(row.destino);
      paramsHistory.push(row.lugar);
      paramsHistory.push(row.clasificacion);
      paramsHistory.push(formatoEvolucion(row.evolucion1, row.evolucion2));
      const resolved = await addPatientTamizaje(paramsPatient).catch((error)=>{
        error.push('No se pudo ingresar en la BD la fila ' + rowNumber);
      });
      if (resolved) {
        await addHistory(paramsHistory[0],
            paramsHistory[1],
            paramsHistory[2],
            paramsHistory[3],
            paramsHistory[4]).catch((error) => {
          error.push('No se pudo ingresar en la BD la fila ' + rowNumber);
        });
      }
    }));
    if (error.length !== 0) {
      return reject(error);
    }
    return resolve('La Carga fue exitosa.');
  });
}

/**
 * Validar si existen todas las columnas y tengan los tipos
 * de datos correspondientes (requetidos, fechas y patrones)para tamizaje.
 * @function
 * @param {Array} rows Array multidimencional con los datos.
 * @return {Array} Lista de errores de columnas faltantes.
 */
function validateTamizaje(rows) {
  const error = [];
  rows.forEach((row, i) => {
    const rowNumber = i + 2;
    isRequired(row.numero, 'A', rowNumber, error);
    isRequired(row.semanaEpid, 'B', rowNumber, error);
    isRequired(row.fecha, 'C', rowNumber, error);
    isRequired(row.documento, 'D', rowNumber, error);
    isRequired(row.nombre, 'E', rowNumber, error);
    isRequired(row.edad, 'F', rowNumber, error);
    isRequired(row.sexo, 'G', rowNumber, error);
    isRequired(row.celular, 'H', rowNumber, error);
    isRequired(row.pais, 'I', rowNumber, error);
    isRequired(row.provincia, 'J', rowNumber, error);
    isRequired(row.distrito, 'K', rowNumber, error);
    isRequired(row.direccion, 'L', rowNumber, error);
    isRequired(row.lugar, 'Y', rowNumber, error);
    isRequired(row.clasificacion, 'Z', rowNumber, error);
    isDate(row.fecha, 'C', rowNumber, error);
    isDate(row.fechaSintomas, 'M', rowNumber, error);
    isDate(row.fechaMuestra, 'N', rowNumber, error);
    isDate(row.fechaResultado1, 'Q', rowNumber, error);
    isDate(row.fechaResultado2, 'T', rowNumber, error);
    isDate(row.fechaResultado3, 'W', rowNumber, error);
    parsePhoneNumber(row.celular, 'H', rowNumber, error);
    parseTipoMuestra(row.tipoMuestra1, 'O', rowNumber, error);
    parseTipoMuestra(row.tipoMuestra2, 'R', rowNumber, error);
    parseTipoMuestra(row.tipoMuestra3, 'U', rowNumber, error);
    parseResultadoMuestra(row.resultadoMuestra1, 'P', rowNumber, error);
    parseResultadoMuestra(row.resultadoMuestra2, 'S', rowNumber, error);
    parseResultadoMuestra(row.resultadoMuestra3, 'V', rowNumber, error);
    parseClasificacion(row.clasificacion, 'Z', rowNumber, error);
  });
  return error;
}

/**
 * Validar si existe la datos en determinada celda
 * @function
 * @param {String} data Información de una celda
 * @param {Number} column Indice de columna
 * @param {Number} row Indice de fila
 * @param {Array} error Array al cual se le agregaran los errores
 */
function isRequired(data, column, row, error) {
  if (data === null || data === undefined) {
    error.push(column + row + ' es obligatorio');
  }
}

/**
 * Validar si existe la datos en determinada celda y que sea del tipo Date.
 * @function
 * @param {Date} data Información de una celda
 * @param {Number} column Indice de columna
 * @param {Number} row Indice de fila
 * @param {Array} error Array al cual se le agregaran los errores
 */
function isDate(data, column, row, error) {
  if (data !== null && data !== undefined && !(data instanceof Date)) {
    error.push(column + row + ' debe ser de tipo Fecha');
  }
}

/**
 * Validar si existe la datos en determinada celda y que tenga
 * similitud con las palabras reservadas de "Tipo de Documento":
 * - DNI
 * - CARNET DE EXTRANJERIA
 * @function
 * @param {String} data Información de una celda
 * @param {Number} column Indice de columna
 * @param {Number} row Indice de fila
 * @param {Array} error Array al cual se le agregaran los errores
 */
// function parseTipoDocumento(data, column, row, error) {
//   if (
//     data !== null &&
//     data !== undefined &&
//     data.toUpperCase() !== 'DNI' &&
//     data.toUpperCase() !== 'CARNET DE EXTRANJERIA'
//   ) {
//     error.push(
//         column +
//         row +
//         ' solo puede tener los siguientes valores' +
//         ' DNI o CARNET DE EXTRANJERIA');
//   }
// }

/**
 * Validar si existe la datos en determinada celda y que tenga
 * formato de un número de celular.
 * @function
 * @param {String} data Información de una celda
 * @param {Number} column Indice de columna
 * @param {Number} row Indice de fila
 * @param {Array} error Array al cual se le agregaran los errores
 */
function parsePhoneNumber(data, column, row, error) {
  if (
    data !== null &&
    data !== undefined &&
    (data.toString().length !== 9 || !/^(9)([0-9]{8})$/.test(data))
  ) {
    error.push(
        column + row + ' el telefono debe comenzar con 9 y ser de 9 digitos');
  }
}

/**
 * Validar si existe la datos en determinada celda y que tenga
 * similitud con las palabras reservadas de "Tipo Muestra":
 * - RAPIDA
 * - P RAPIDA
 * - P. RAPIDA
 * - HISOPADO NASOFARINGEO Y OROFARINGEO
 * - MOLECULAR
 * - NO TIENE
 * @function
 * @param {String} data Información de una celda
 * @param {Number} column Indice de columna
 * @param {Number} row Indice de fila
 * @param {Array} error Array al cual se le agregaran los errores
 */
function parseTipoMuestra(data, column, row, error) {
  if (
    data !== null &&
    data !== undefined &&
    data.toUpperCase() !== 'RAPIDA' &&
    data.toUpperCase() !== 'P RAPIDA' &&
    data.toUpperCase() !== 'P. RAPIDA' &&
    data.toUpperCase() !== 'HISOPADO NASOFARINGEO Y OROFARINGEO' &&
    data.toUpperCase() !== 'MOLECULAR' &&
    data.toUpperCase() !== 'NO TIENE'
  ) {
    error.push(
        column +
        row +
        ' solo puede tener los siguientes valores P RAPIDA,' +
        ' HISOPADO NASOFARINGEO Y OROFARINGEO, MOLECULAR, NO TIENE');
  }
}

/**
 * Validar si existe la datos en determinada celda y que tenga
 * similitud con las palabras reservadas de "Resultado de muestra":
 * - POSITIVO
 * - REACTIVO
 * - NEGATIVO
 * - PENDIENTE
 * @function
 * @param {String} data Información de una celda
 * @param {Number} column Indice de columna
 * @param {Number} row Indice de fila
 * @param {Array} error Array al cual se le agregaran los errores
 */
function parseResultadoMuestra(data, column, row, error) {
  if (
    data !== null &&
    data !== undefined &&
    data.toUpperCase() !== 'POSITIVO' &&
    data.toUpperCase() !== 'REACTIVO' &&
    data.toUpperCase() !== 'NEGATIVO' &&
    data.toUpperCase() !== 'PENDIENTE'
  ) {
    error.push(
        column +
        row +
        ' solo puede tener los siguientes valores' +
        'POSITIVO, REACTIVO, NEGATIVO, PENDIENTE');
  }
}

/**
 * Validar si existe la datos en determinada celda y que tenga
 * similitud con las palabras reservadas de "Clasificación" de un paciente:
 * - DESCARTADO
 * - SOSPECHOSO
 * - CONFIRMADO
 * @function
 * @param {String} data Información de una celda
 * @param {Number} column Indice de columna
 * @param {Number} row Indice de fila
 * @param {Array} error Array al cual se le agregaran los errores
 */
function parseClasificacion(data, column, row, error) {
  if (
    data !== null &&
    data !== undefined &&
    data.toUpperCase() !== 'DESCARTADO' &&
    data.toUpperCase() !== 'SOSPECHOSO' &&
    data.toUpperCase() !== 'CONFIRMADO'
  ) {
    error.push(
        column +
        row +
        ' solo puede tener los siguientes valores' +
        ' DESCARTADO, SOSPECHOSO, CONFIRMADO');
  }
}

/**
 * @function
 * @param {String} apellidoPaterno Apellido paterno de una persona
 * @param {String} apellidoMaterno Apellido materno de una persona
 * @param {String} nombre Nombre de una persona
 * @return {String} Nombre completo de la persona
 */
function concatApellidosNombrePG(apellidoPaterno, apellidoMaterno, nombre) {
  const result = apellidoPaterno + ' ' + apellidoMaterno + ' ' + nombre;
  return result;
}

/**
 * @function
 * @param {String} numero valor de celda que se parseara formato DNI
 * @return {String} Valor en formato DNI
 */
function numeroDocumento(numero) {
  numero = numero.toString();
  if (+numero && numero.length === 7) {
    numero = numero.padStart(8, 0);
  }
  return numero;
}

/**
 * Validar si el valor es de tipo "Resultado de muestra" y devolver
 * un entero que hace refrencia al valor. Los tipo de "Resultado de muestra":
 * - NEGATIVO
 * - REACTIVO
 * - POSITIVO
 * - PENDIENTE
 * @function
 * @param {String} resultado valor de celda de tipo "Resultado de muestra"
 * @return {Number} Entero que representa el ID de dicha muestra
 */
function resultadoMuestra(resultado) {
  let result = null;
  if (resultado) {
    if (resultado.toUpperCase() === 'NEGATIVO') {
      result = 1;
    } else if (resultado.toUpperCase() === 'REACTIVO') {
      result = 2;
    } else if (resultado.toUpperCase() === 'POSITIVO') {
      result = 2;
    } else if (resultado.toUpperCase() === 'PENDIENTE') {
      result = 3;
    }
  } else {
    result = 3;
  }
  return result;
}

/**
 * Validar si el valor es de tipo "Tipo de prueba" y devolver
 * un texto normalizado (sin tildes, todo mayuscula, etc)
 * Los tipo de "Tipo de prueba":
 * - RAPIDA
 * - P RAPIDA
 * - P. RAPIDA
 * - HISOPADO NASOFARINGEO Y OROFARINGEO
 * - MOLECULAR
 * - NO TIENE
 * @function
 * @param {String} tipo valor de celda de tipo "Tipo de prueba"
 * @return {String} Valor ingresado pero normalizado
 */
function tipoPrueba(tipo) {
  let result = null;
  if (tipo) {
    if (tipo.toUpperCase() === 'RAPIDA') {
      result = 'RAPIDA';
    }
    if (tipo.toUpperCase() === 'P RAPIDA') {
      result = 'RAPIDA';
    }
    if (tipo.toUpperCase() === 'P. RAPIDA') {
      result = 'RAPIDA';
    }
    if (tipo.toUpperCase() === 'HISOPADO NASOFARINGEO Y OROFARINGEO') {
      result = 'MOLECULAR';
    }
    if (tipo.toUpperCase() === 'MOLECULAR') {
      result = 'MOLECULAR';
    }
  }
  return result;
}


/**
 * Validar si el valor es de tipo "Confirmacion Covid" y devolver
 * el resultado binario como true o false.
 * Los tipo de "Confirmacion Covid":
 * - CONFIRMADO
 * - DESCARTADO
 * @function
 * @param {String} rpta valor de celda de tipo "Confirmacion Covid"
 * @return {Boolean} Si esta confirmado o no
 */
function confirmacionCovid19(rpta) {
  let result = false;
  if (rpta && (rpta.toUpperCase() == 'CONFIRMADO' ||
        rpta.toUpperCase() == 'DESCARTADO')) {
    result = true;
  }
  return result;
}

/**
 * Concatenar las evoluciones de un paciente
 * @function
 * @param {String} evolucion1 valor de la primera evaluación
 * @param {String} evolucion2 valor de la segunda evaluación
 * @return {Boolean} Si esta confirmado o no
 */
function formatoEvolucion(evolucion1, evolucion2) {
  let result = '';
  if (evolucion1 !== undefined) {
    result = evolucion1;
  }
  if (evolucion2 !== undefined) {
    result = result + '' + evolucion2;
  }
  return result;
}

module.exports = {
  excelAdmision,
  excelTamizaje,
};
