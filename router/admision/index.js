const { Router } = require("express")
const router = Router()
var pgp = require("pg-promise")()

const cn = {
    host: 'f099c6af-c61f-4ecc-9fb3-eda80065846a.6131b73286f34215871dfad7254b4f7d.databases.appdomain.cloud',
    port: 31655,
    database: 'ibmclouddb',
    user: 'ibm_cloud_94c834e7_e9e5_4139_812d_9a48714c1e9e',
    password: '7dad29c721a3a814ac550c8dc427fc65651aac0cbe4e86c58af06061e848e697',
    ssl: true
};

const db = pgp(cn);

const readXlsxFile = require('read-excel-file/node');
  
  var parsePhoneNumber = function(value) {
	if(value.toString().length !== 9) {
		return false;
	}
	return /^(9)([0-9]{8})$/.test(value);
  };

  var parseDocumentNumber = function(value) {
	console.log(value)
	if(value === 'DNI') {
		return 1;
	}
	return 2;
  };

router.get("/", (req, res)=>{
	res.sendFile(__dirname + '/index.html')
})

router.post("/respuesta-admision", (req, res)=>{
	readXlsxFile(req.body.fileAdmision.path, { schema }).then((rows, error) => {
		//rows.forEach(function(value){
		//	_saveAdmision(value);
		//  });
		  res.send(rows)
	})
})

var _saveAdmision = function(value) {
	console.log("save");
	console.log(value);
}

const schema = {

	//'N°': {
	//	prop: 'numero',
	//	type: Number,
	//	required: true
	//},
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
	'TIPO DOCUMENTO': {
		prop: 'tipoDocumento',
		required: true,
		//oneOf: [
		//  'DNI',
		//  'Carnet de extranjeria'
		//],
		parse(value) {
			const number = parseDocumentNumber(value)
			if (!number) {
				throw new Error('invalid')
			  }
			  console.log(number)
		  return number
		}
	},
	'DNI': {
	  prop: 'numeroDocumento',
	  type: String,
	  required: true
	},
	'DIRECCIÓN': {
	  prop: 'numeroDocumento',
	  type: String
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
	  type: String
	}
}

module.exports = router