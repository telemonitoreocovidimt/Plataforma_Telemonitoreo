const admisionSchema = {
	'Nº': {
		prop: 'numero',
		type: Number,
		required: true
	},
	'FECHA': {
	  prop: 'fecha',
	  type: Date,
	  required: true
	},
	'APELLIDOS Y NOMBRES': {
	  prop: 'nombresCompleto',
	  type: String,
	  required: true
	},
	'TIPO DOC': {
	  prop: 'tipoDocumento',
	  type: String,
	  required: true
	},
	'DNI': {
	  prop: 'numeroDocumento',
	  type: String,
	  required: true
	},
	'DIRECCIÓN': {
	  prop: 'direccion',
	  type: String,
	  required: true
	},
	'CELULAR': {
	  prop: 'celular',
	  type: Number,
	  required: true,
	  parse(value) {
		const number = parsePhoneNumber(value)
		if (!number) {
		  throw new Error('invalid')
		}
		return value
	  }
	},
	'FIJO': {
	  prop: 'fijo',
	  type: String,
	  required: true
	}
}

const tamizajeSchema = {
	'N°': {
	  prop: 'numero',
	  type: Number,
	  required: true
	},
	'SE': {
	  prop: 'semanaEpid',
	  type: Number,
	  required: true
	},
	'Fecha de atención': {
	  prop: 'fechaAtencion',
	  type: Date,
	  required: true
	},
	'DNI/ C. Extr': {
	  prop: 'numeroDocumento',
	  type: String,
	  required: true
	},
	'Apellidos y Nombres': {
	  prop: 'nombresCompleto',
	  type: String,
	  required: true
	},
	'Edad': {
	  prop: 'edad',
	  type: Number,
	  required: true
	},
	'Sexo': {
	  prop: 'sexo',
	  type: String,
	  required: true
	},
	'Celular': {
	  prop: 'celular',
	  type: Number,
	  required: true,
	  parse(value) {
		const number = parsePhoneNumber(value)
		if (!number) {
		  throw new Error('invalid')
		}
		return value
	  }
	},
	'Pais posible infección': {
	  prop: 'paisInfeccion',
	  type: String
	},
	'Provincia Residencia actual': {
	  prop: 'provinciaResidencia',
	  type: String
	},
	'Distrito de residencia actual': {
	  prop: 'distritoResidencia',
	  type: String
	},
	'Direcion residencia actual': {
	  prop: 'direccion',
	  type: String
	},
	'Fecha Inicio de síntomas': {
	  prop: 'fechaInicio',
	  type: Date,
	  required: true
	},
	'Fecha toma de muestra': {
	  prop: 'fechaMuestra',
	  type: Date,
	  required: true
	},
	'Tipo de muestra 1': {
	  prop: 'tipoMuestra1',
	  type: String
	},
	'Resultado Tipo de muestra 1': {
	  prop: 'resultadoTipoMuestra1',
	  type: String
	},
	'Fecha de resultado Tipo de muestra 1': {
	  prop: 'fechaTipoMuestra1',
	  type: Date
	},
	'Tipo de muestra 2': {
	  prop: 'tipoMuestra2',
	  type: String
	},
	'Resultado Tipo de muestra 2': {
	  prop: 'resultadoTipoMuestra2',
	  type: String
	},
	'Fecha de resultado Tipo de muestra 2': {
	  prop: 'fechaTipoMuestra2',
	  type: Date
	},
	'Tipo de muestra 3': {
	  prop: 'tipoMuestra3',
	  type: String
	},
	'Resultado Tipo de muestra 3': {
	 prop: 'resultadoTipoMuestra3',
	 type: String
	},
	'Fecha de resultado Tipo de muestra 3': {
	  prop: 'fechaTipoMuestra3',
	  type: Date
	},
	'Destino': {
	  prop: 'destino',
	  type: String
	},
	'Lugar de destino': {
	  prop: 'lugarDestino',
	  type: String
	},
	'CLASIFICACION EPIDEMIOLOGICA': {
	  prop: 'clasificacion',
	  type: String
	},
	'EVOLUCION 1': {
	  prop: 'evolucion1',
	  type: String
	},
	'EVOLUCION 2': {
	  prop: 'evolucion2',
	  type: String
	}
  }

var parsePhoneNumber = function(value) {
if(value.toString().length !== 9) {
	return false;
}
return /^(9)([0-9]{8})$/.test(value);
};

module.exports = {
    admisionSchema
}