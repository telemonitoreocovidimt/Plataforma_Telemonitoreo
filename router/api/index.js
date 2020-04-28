const { Router } = require("express")
const router = Router()
const { getPatientsSurvey01, getPatientsSurvey02, existePatient, save_answer, patient_change_status, patient_change_risk_factor, patient_change_age, validate_group_case } = require("./../../model/api")
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

async function answer_daily_survey(patient_id, answers){
  
  let patientToUrgency = 0;
  let patientToNormalTray = 0;

  for(const i in answers){
    let variable = answers[i].variable
    let answer = answers[i].answer
    let asked_at = answers[i].asked_at
    let answered_at = answers[i].answered_at
    let rows = await save_answer(patient_id, variable, answer, asked_at, answered_at)
    if((variable == "dificultad_para_respirar" || variable == "dolor_pecho" ||
        variable == "confusion_desorientacion" || variable == "labios_azules") && 
        answer.toUpperCase() == "SI"){
        patientToUrgency++
    }
    if((variable == "fiebre_hoy" || variable == "diarrea") && answer.toUpperCase() == "SI") {
        patientToNormalTray++;
    }

  }
    
  console.log("patientToUrgency: " + patientToUrgency);
  console.log("patientToNormalTray: " + patientToNormalTray);

  if(patientToUrgency > 0){
    //pasa a urgencia
    let x = await patient_change_status(patient_id, 3)
    await makeMigrationsCustomer(patient_id)
  }

  if(patientToNormalTray == 2){
    //pasa a bandeja normal
    let x = await patient_change_status(patient_id, 2)
    await makeMigrationsCustomer(patient_id)
  }
  
}

async function answer_initial_survey(patient_id, answers){
  console.log(answers)
  console.log(answers.length  )
  if(answers.length == 0)
    return
  //Varibles for update factor and age
  let is_risk_factor = null
  let patient_age = 0

  //Save questions
  for(let i in answers){
    let variable = answers[i].variable
    let answer = answers[i].answer
    let asked_at = answers[i].asked_at
    let answered_at = answers[i].answered_at

    //Insert aswers
    let rows = await save_answer(patient_id, variable, answer, asked_at, answered_at)
    if(variable == "edad_paciente")
      patient_age = parseInt(answers[i].answer)
    if(variable == "comorbilidades" && answer.toUpperCase() == "SI"){
      is_risk_factor = true;
    }
    if(variable == "comorbilidades" && answer.toUpperCase() == "NO"){
      is_risk_factor = false;
    }
  }
  console.log(patient_id)
  console.log("Paciente edad ", patient_age)
  console.log("Factor ", is_risk_factor)
  console.log("Validar condicion", is_risk_factor != null)
  if (patient_age != 0){
    await patient_change_age(patient_id, patient_age)
    if(is_risk_factor != null){
      await patient_change_risk_factor(patient_id, is_risk_factor)
      await validate_group_case(patient_id)
    }
  }
}

router.get("/:survey",async (req, res)=>{
    let params = req.params

    if(params.survey == 'survey01'){
        let patients = await getPatientsSurvey01()
        res.json(arrayJsonToPatientsList(patients))
    }
    else if(params.survey == 'survey02'){
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
      let answers = req.body.answers
      if(answers == null || answers.length == 0){
        res.json({"success": "bad", "message": "No se detectó respuestas."})
      }else{

        if(req.body.survey == "encuesta_inicial_covid_19_hch"){

          //ENCUESTA INICIAL
          console.log("ENCUESTA INICIAL")
          answer_initial_survey(dni_patient, answers)
          res.json({"success": "ok", "message": "Preguntas en proceso de grabado."})

        }else if(req.body.survey == "encuesta_monitoreo_covid_19_hch"){

          //ENCUESTA DIARIA
          console.log("ENCUESTA DIARIA")
          answer_daily_survey(dni_patient, answers)
          res.json({"success": "ok", "message": "Preguntas en proceso de grabado."})
          
        }else{
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