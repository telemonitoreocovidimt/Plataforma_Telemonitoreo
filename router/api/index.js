const { Router } = require("express")
const router = Router()
const { getPatientsSurvey01, getPatientsSurvey02, existePatient, save_answer, patient_change_status, patient_change_risk_factor, patient_change_age } = require("./../../model/api")

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

    let rows = await save_answer(patient_id, answers[i].variable, answers[i].value, answers[i].asked_at, answers[i].answered_at)
    if((answers[i].variable == "dificultad_para_respirar" || answers[i].variable == "dolor_pecho" ||
        answers[i].variable == "confusion_desorientacion" || answers[i].variable == "labios_azules") && 
        answers[i].value.toUpperCase() == "SI"){
        patientToUrgency++
    }
    if((answers[i].variable == "fiebre_hoy" || answers[i].variable == "diarrea") && answers[i].value.toUpperCase() == "SI") {
        patientToNormalTray++;
    }

  }
    
  console.log("patientToUrgency: " + patientToUrgency);
  console.log("patientToNormalTray: " + patientToNormalTray);

  if(patientToUrgency > 0){
    //pasa a urgencia
    let x = await patient_change_status(patient_id, 3)
  }

  if(patientToNormalTray == 2){
    //pasa a bandeja normal
    let x = await patient_change_status(patient_id, 2)
  }
  
}

async function answer_initial_survey(patient_id, answers){
  
  let is_risk_factor = false;
  let patient_age = 0;
  for(const i in answers){
    let rows = await save_answer(patient_id, answers[i].variable, answers[i].value, answers[i].asked_at, answers[i].answered_at)
    if(answers[i].variable == "edad_paciente") patient_age = parseInt(answers[i].value);
    if(answers[i].variable == "comorbilidades" && answers[i].value.toUpperCase() == "SI"){
      is_risk_factor = true;
    }
  }
  console.log(is_risk_factor);
  let x = await patient_change_risk_factor(patient_id, is_risk_factor)
  let y = await patient_change_age(patient_id, patient_age)
  
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
  if(req.body.patient_code){
    let patient = await existePatient(req.body.patient_code)
    if(patient.length){
      let dni_patient = patient[0].identity_document
      let answers = req.body.answers

      if(answers == null || answers.length == 0){
        res.json({"success": "bad", "message": "No se detectó respuestas."})
      }else{

        if(req.body.survey == "encuesta_inicial_covid_19_hch"){
          //ENCUESTA INICIAL
          console.log("ENCUESTA INICIAL")
          answer_initial_survey(req.body.patient_code, answers)
        }else if(req.body.survey == "encuesta_monitoreo_covid_19_hch"){
          //ENCUESTA DIARIA
          console.log("ENCUESTA DIARIA")
          answer_daily_survey(req.body.patient_code, answers)
        }else{
          res.json({"success": "bad", "message": "Encuesta inválida"})
        }
        
        res.json({"success": "ok", "message": "Preguntas en proceso de grabado."})
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