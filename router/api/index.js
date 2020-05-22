const { Router } = require("express")
const router = Router()
const { getPatientsSurvey01, getPatientsSurvey02, existePatient, save_answer, patient_change_status, patient_change_risk_factor, patient_change_age, validate_group_case, patient_is_doctor } = require("./../../model/api")
const { makeMigrationsCustomer } = require("./../../model/migration")

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

module.exports = router