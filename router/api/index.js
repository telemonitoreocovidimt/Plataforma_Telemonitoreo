const { Router } = require("express")
const router = Router()
const { getPatientsSurvey01, exists_case_patient, getPatientsSurvey02, getPatientsSurvey03, existePatient, save_answer, patient_change_status, patient_change_risk_factor, patient_change_age, validate_group_case, patient_is_doctor } = require("./../../model/api")
const { makeMigrationsCustomer } = require("./../../model/migration")
const { casos_dia, encuestas_iniciales, encuestas_diarias } = require("./../../controllers/report")
const { check } = require("express-validator")
const { isValidDate } = require("./../../useful")
const { listContactByDNI, getPatientContactByDNI, getContactByDNI, getMonitoreoContactsByDNI, addPermissionContact,
  removePermissionContact } = require("./../../model/dashboard")


//Import Validation
const { isDNI } = require("./../../libs/validation/index");
const CayetanoString = require("./../../res/string");

async function getContact(req, res){
  
  let dni = req.query.dni
  let data = {
    "dni": dni,
    "edad": "",
    "factor_riesgo": false,
    "seguimiento": 0,
    "nombre": "",
    "observacion": "",
    "parentesco": "",
    "dia":1,
    "monitoreo": "",
    "monitoreos":[]
  }
  if(dni){
    let rs = await getPatientContactByDNI(dni)
    if(rs.result.length > 0){
      data = rs.result[0]
    }
    else{
      rs = await getContactByDNI(dni)
      if(rs.result.length > 0){
        data = rs.result[0]
      }
    }

    rs = await getMonitoreoContactsByDNI(dni)
    data["monitoreos"] = rs.result
  }
  
  for(let key in data){
    if(data[key] == null)
      data[key] = ""
  }

  res.json({
    success:true,
    data
  })
}

async function takeContact(req, res){

  //GET BODY
  let body = req.body
  let dni_contact = body.dni_contact
  let dni_patient = body.dni_patient

  //VALIDATE BODY
  if(!isDNI(dni_contact))
    return res.status(400).json({"status": false, "message":CayetanoString.ERROR.ERROR_MESSAGE_NOT_VALID_DNI, "field": "dni_contact"})
  if(!isDNI(dni_patient))
    return res.status(400).json({"status": false, "message":CayetanoString.ERROR.ERROR_MESSAGE_NOT_VALID_DNI, "field": "dni_patient"})


  //RUN MODEL FUNCTIONS FOR TASK
  let data = await removePermissionContact(dni_contact, true)
  console.log("Remove : ", data.result)
  data = await addPermissionContact(dni_contact, dni_patient, false, data.client)
  console.log("Add : ", data.result)

  //RETURN ANSWER
  if(data.result.rowCount)
    return res.status(200).json({"status": true, "message":CayetanoString.SUCCESS.SUCCESS_MESSAGE_TAKE_CONTACT, "field": "dni_patient"})
  else
    return res.status(400).json({"status": false, "message":CayetanoString.ERROR.ERROR_MESSAGE_ERROR_TAKE_CONTACT, "field": "dni_patient"}) 

}

async function movePatient(req, res){
  let dni_patient = req.body.dni_patient
  if(dni_patient){

    let rs = await patient_change_status(dni_patient, 2)
    rs = await exists_case_patient(dni_patient)
    

    if(rs.length){
      await makeMigrationsCustomer(dni_patient)
    }
    
    return res.json({
      success: rs.length > 0
    })
  }
  else{
    return res.json({
      success:false
    })
  }
}

function arrayJsonToPatientsList(patients){
    let list_patients = []
    patients.forEach(patient => {
        list_patients.push({
            "code": patient.codigo,
            "identity_document": {
              "number": patient.dni
            },
            "name":{
              "name": patient.nombre,
              "family_name_1": "",
              "family_name_2": ""
            },
            "mobile_phone": patient.celular
          })
    })
    let format = {
        "status":"ok",
        "details": {
          "patients": list_patients
        }
    }
    return format
}

async function answer_daily_survey(patient, answers, tray){
  console.log(patient)
  let patient_id = patient.dni
  // let patientToUrgency = 0;
  // let patientToNormalTray = 0;

  for(const i in answers){
    let variable = answers[i].variable
    let answer = answers[i].answer
    let asked_at = answers[i].asked_at
    let answered_at = answers[i].answered_at
    let rows = await save_answer(patient_id, variable, answer, asked_at, answered_at)
    // if((variable == "dificultad_para_respirar" || variable == "dolor_pecho" ||
    //     variable == "confusion_desorientacion" || variable == "labios_azules") && 
    //     answer.toUpperCase() == "SI"){
    //     patientToUrgency++
    // }
    // if((variable == "fiebre_hoy" || variable == "diarrea") && answer.toUpperCase() == "SI") {
    //     patientToNormalTray++;
    // }
  }


  if(tray == 3){
    //pasa a urgencia
    let x = await patient_change_status(patient_id, 3)
    await makeMigrationsCustomer(patient_id)
  }

  if(tray == 2){
    //pasa a bandeja normal
    let x = await patient_change_status(patient_id, 2)
    await makeMigrationsCustomer(patient_id)
  }
  
}

async function answer_final_survey(patient, answers, tray){
  
  let patient_id = patient.dni
  let need_doctor = false

  for(const i in answers){
    let variable = answers[i].variable
    let answer = answers[i].answer
    let asked_at = answers[i].asked_at
    let answered_at = answers[i].answered_at
    let rows = await save_answer(patient_id, variable, answer, asked_at, answered_at)
    // if((variable == "dificultad_para_respirar" || variable == "dolor_pecho" ||
    //     variable == "confusion_desorientacion" || variable == "labios_azules") && 
    //     answer.toUpperCase() == "SI"){
    //     patientToUrgency++
    // }
    // if((variable == "fiebre_hoy" || variable == "diarrea") && answer.toUpperCase() == "SI") {
    //     patientToNormalTray++;
    // }
    if(variable === "necesita_medico" && answer.toUpperCase() === "SI"){
      need_doctor = true
    }
  }

  if(tray == 3){
    //pasa a urgencia
    let x = await patient_change_status(patient_id, 3)
    await makeMigrationsCustomer(patient_id)
  }
  else if(need_doctor || tray == 2){
    //pasa a bandeja normal
    let x = await patient_change_status(patient_id, 2)
    await makeMigrationsCustomer(patient_id)
  }

  

 
  
}

async function answer_initial_survey(patient, answers, tray){
  let patient_id = patient.dni
  if(answers.length == 0)
    return
  //Varibles for update factor and age
  let is_risk_factor = null
  let patient_age = 0
  let is_doctor = false

  //Save questions
  for(let i in answers){
    let variable = answers[i].variable
    let answer = answers[i].answer
    let asked_at = answers[i].asked_at
    let answered_at = answers[i].answered_at

    //Insert aswers
    console.log("Save answer")
    console.log(patient_id, variable, answer, asked_at, answered_at)
    let rows = await save_answer(patient_id, variable, answer, asked_at, answered_at)
    console.log("Answer saved")
    if(variable == "edad_paciente") //Validate age of patient
      patient_age = parseInt(answers[i].answer)
    if(variable == "comorbilidades" && answer.toUpperCase() == "SI"){
      is_risk_factor = true;
    }
    if(variable == "comorbilidades" && answer.toUpperCase() == "NO"){
      is_risk_factor = false;
    }
    if(variable === "es_profesional_salud" && answer.toUpperCase() === "SI"){
      is_doctor = true
    }
  }
  console.log(is_risk_factor)
  console.log(patient_age)
  console.log(is_doctor)
  if (patient_age != 0){
    if(is_risk_factor != null){
      await patient_change_age(patient_id, patient_age) //Update age and flag "paso_encuesta_inicial"
      await patient_change_risk_factor(patient_id, is_risk_factor) //Change risk factor and change group
      console.log("Is doctor : ", is_doctor)
      if(is_doctor){
        await patient_is_doctor(patient_id)
      }
      else{
        await validate_group_case(patient_id) //Create case if group C with risk factor or if is group A or B
      }
    }
  }
}

router.get("/:survey",async (req, res)=>{
    let params = req.params

    if(params.survey === 'survey01'){
        let patients = await getPatientsSurvey01()
        res.json(arrayJsonToPatientsList(patients))
    }
    else if(params.survey === 'survey02'){
        let patients = await getPatientsSurvey02()
        res.json(arrayJsonToPatientsList(patients))
    }
    else if(params.survey === 'survey03'){
      let patients = await getPatientsSurvey03()
      res.json(arrayJsonToPatientsList(patients))
    }
    else{
        res.json({"status":"bad"})
    }
})

router.post("/save_answers", async (req, res)=>{
  if(req.body.identity_document){
    let patient = await existePatient(req.body.identity_document)
    if(patient.length){
      let dni_patient = req.body.identity_document
      let tray = req.body.tray
      let answers = req.body.answers
      if(answers == null || answers.length == 0){
        res.json({"success": "bad", "message": "No se detectó respuestas."})
      }else{

        if(req.body.survey == "encuesta_inicial_covid_19_hch"){
          //ENCUESTA INICIAL
          answer_initial_survey(patient[0], answers, tray)
          res.json({"success": "ok", "message": "Preguntas en proceso de grabado."})

        }else if(req.body.survey == "encuesta_monitoreo_covid_19_hch"){

          //ENCUESTA DIARIA
          answer_daily_survey(patient[0], answers, tray)
          res.json({"success": "ok", "message": "Preguntas en proceso de grabado."})
          
        }
        else if(req.body.survey == "encuesta_final_covid_19_hch"){

          //ENCUESTA FINAL
          answer_final_survey(patient[0], answers, tray)
          res.json({"success": "ok", "message": "Preguntas en proceso de grabado."})
          
        }
        else{
          res.json({"success": "bad", "message": "Encuesta inválida"})
        }
        
      }  
    }
    else{
      res.json({"success": "bad", "message": "Paciente no existe."})
    }
  }
  else{
    res.json({"success": "bad", "message": "Estructura invalida."})
  }
})

let message_error_date = "Tipo de dato invalido, es necesario una fecha."
let array_validation =  [
  check('from').notEmpty(),
  check('from').custom(isValidDate).withMessage(message_error_date),
  check('from').toDate(),
  check('to').notEmpty(),
  check('to').custom(isValidDate).withMessage(message_error_date),
  check('to').toDate(),
]

router.get("/report/case/:from/:to", array_validation, casos_dia)

router.get("/report/initial_survey/:from/:to", array_validation, encuestas_iniciales)

router.get("/report/daily_survey/:from/:to", array_validation, encuestas_diarias)

// /api/v1/ajax/contact?dni
router.get("/ajax/contact", getContact)

router.put("/ajax/contact", takeContact)

router.post("/tray/move/normal", movePatient)

module.exports = router

// http://localhost:3000/api/v1/report/case/2020-01-20/2020-12-20
// http://localhost:3000/api/v1/report/initial_survey/2020-01-20/2020-12-20
// http://localhost:3000/api/v1/report/daily_survey/2020-01-20/2020-12-20