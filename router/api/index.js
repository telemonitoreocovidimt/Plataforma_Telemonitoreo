const { Router } = require("express")
const router = Router()
const { getPatientsSurvey01, getPatientsSurvey02, existePatient, save_answer, patient_change_status } = require("./../../model/api")

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

async function answer_daily_survey(patient_id, answers, index=0, patientToUrgency = 0, patientToNormalTray = 0){
  
  if(index >= answer.length){
    return
  }
  
  let answer = answers[index]
  let rows = await save_answer(patient_id, answer.variable, answer.answer, answer.asked_at, answer.answered_at)
  if((answer.variable == "dificultad_para_respirar" || answer.variable == "dolor_pecho" ||
      answer.variable == "confusion_desorientacion" || answer.variable == "labios_azules") && 
      answer.answer == "SI"){
      patientToUrgency++
  }
  if((answer.id == "fiebre_hoy" || answer.id == "diarrea") && answer.value == "SI") {
      patientToNormalTray++;
  }
    
  if(patientToUrgency > 0){
    //pasa a urgencia
    let x = await patient_change_status(patient_id, 3)
  }

  if(patientToNormalTray == 2){
    //pasa a bandeja normal
    let x = await patient_change_status(patient_id, 2)
  }
  
  answer_daily_survey(patient_id, answers, index, patientToUrgency, patientToNormalTray)
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
      answer_daily_survey(dni_patient, answers)
      res.json({"success": "ok", "message": "Preguntas en proceso de grabado."})
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