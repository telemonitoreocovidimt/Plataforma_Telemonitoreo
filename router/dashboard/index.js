const { Router } = require("express")
const router = Router()
const { getPatientsAlert, getPatients, countAllCaseToday, countAllCaseAttendedToday,
     countAllCaseAttendedToDayForDoctor, countAllCaseAttendedToDayBetweenDoctors, takeCase, canTakeCase,
     getStatusPatients, canTerminateCase, terminateCase, getMyPatients, getCase, updateCase, dropCase, getPatientForCase, removeScheduledCase, addScheduledCase, haveThisScheduledCaseForTomorrow,getComentarios,getNoteByPatient, updateNoteByPatient } = require("./../../model/dashboard")

router.get("/old",async (req, res)=>{

    if(req.session.user){
        let data = await getPatientsAlert(true)
        let cases_alert = data.result
        data = await getPatients(true, data.client)
        let cases = data.result
        data = await getMyPatients(req.session.user.dni, true, data.client)
        let my_cases = data.result
        data = await countAllCaseToday(true, data.client)
        let cases_for_attent = data.result
        data = await countAllCaseAttendedToday(true, data.client)
        let cases_attented = data.result
        data = await countAllCaseAttendedToDayForDoctor(req.session.user.dni, true, data.client)
        let cases_attented_for_me = data.result
        data = await countAllCaseAttendedToDayBetweenDoctors(false, data.client)
        
       
        let count = 0
        let sum = 0
        data.result.forEach((json)=>{
            count++
            sum+=parseInt(json.count)
        })
        let cases_attented_promean = 0;
        if ( count && sum ){
            cases_attented_promean = parseInt(sum/count)
        }

        await req.useFlash(res)
        res.render("dashboard", {  layout: 'main',
            islogin:true,
            ...req.session.user, 
            cases_alert, 
            cases,
            my_cases,
            cases_attented_for_me : cases_attented_for_me[0].count , 
            cases_attented_promean, 
            cases_for_attent: cases_for_attent[0].count,
            cases_attented : cases_attented[0].count
        })
    }
    else{
        await req.flash("danger", "Usted no ha iniciado sesión.")
        res.redirect("/")
    }
})

router.get("/",async (req, res)=>{

    if(req.session.user){
        let data = await getPatientsAlert(req.session.user.dni, true)
        let cases_alert = data.result
        data = await getPatients(req.session.user.dni, true, data.client)
        let cases = data.result
        /*
        data = await getMyPatients(req.session.user.dni, true, data.client)
        let my_cases = data.result*/
        data = await countAllCaseToday(true, data.client)
        let cases_for_attent = data.result
        data = await countAllCaseAttendedToday(true, data.client)
        let cases_attented = data.result
        data = await countAllCaseAttendedToDayForDoctor(req.session.user.dni, true, data.client)
        let cases_attented_for_me = data.result
        data = await countAllCaseAttendedToDayBetweenDoctors(false, data.client)
        let count = 0
        let sum = 0
        data.result.forEach((json)=>{
            count++
            sum+=parseInt(json.count)
        })
        let cases_attented_promean = 0;
        if ( count && sum ){
            cases_attented_promean = parseInt(sum/count)
        }

        await req.useFlash(res)
        res.render("dashboard1", {  layout: 'main1',
            islogin:true,
            ...req.session.user, 
            cases_alert, 
            cases,
           
            cases_attented_for_me : cases_attented_for_me[0].count , 
            cases_attented_promean, 
            cases_for_attent: cases_for_attent[0].count,
            cases_attented : cases_attented[0].count
        })
    }
    else{
        await req.flash("danger", "Usted no ha iniciado sesión.")
        res.redirect("/")
    }
})


router.get("/mibandeja",async (req, res)=>{

    if(req.session.user){
        
        let data = await getPatientsAlert(true)
        let cases_alert = data.result
        data = await getPatients(true, data.client)
        let cases = data.result 
        
         data = await getMyPatients(req.session.user.dni, true, data.client)
        let my_cases = data.result
        data = await countAllCaseToday(true, data.client)
        let cases_for_attent = data.result
        data = await countAllCaseAttendedToday(true, data.client)
        let cases_attented = data.result
        data = await countAllCaseAttendedToDayForDoctor(req.session.user.dni, true, data.client)
        let cases_attented_for_me = data.result
        data = await countAllCaseAttendedToDayBetweenDoctors(false, data.client)
        let count = 0
        let sum = 0
        data.result.forEach((json)=>{
            count++
            sum+=parseInt(json.count)
        })
        let cases_attented_promean = 0;
        if ( count && sum ){
            cases_attented_promean = parseInt(sum/count)
        }

        await req.useFlash(res)
        res.render("mycases", {  layout: 'main1',
            islogin:true,
            ...req.session.user, 
            my_cases,
            cases_attented_for_me : cases_attented_for_me[0].count , 
            cases_attented_promean, 
            cases_for_attent: cases_for_attent[0].count,
            cases_attented : cases_attented[0].count
        })
    }
    else{
        await req.flash("danger", "Usted no ha iniciado sesión.")
        res.redirect("/")
    }
})

router.get("/case/:case",async (req, res)=>{

    req.params.case = parseInt(req.params.case)
    if(req.session.user){
        if(req.params.case){
            if (typeof(req.params.case) != 'number'){
                await req.flash("danger", `Codigo ${req.param.case}, no es valido.`)
                res.redirect("/dashboard")
            }
            else{
                let id_case = req.params.case
                let dni_medico = req.session.user.dni
                let data = await canTakeCase(dni_medico, id_case)
                let canTake = data.result
                if(canTake[0].pasa){
                    data = await getPatientForCase(id_case, true)
                    let dni_paciente  = data.result[0].dni
                    console.log("Datos del paciente")
                    console.log(data.result[0])
                    let condicion_egreso = data.result[0].condicion_egreso
                    data = await haveThisScheduledCaseForTomorrow(dni_medico, dni_paciente, true, data.client)
                    let have_this_scheduled_case = data.result.length > 0 ? true : false
                    data = await takeCase(id_case, dni_medico, true, data.client)
                    let taked = data.result
                    data = await getCase(id_case, true, data.client)
                    let cases = data.result
                    data = await getStatusPatients(false, data.client)
                    let status_patients = data.result

                    let groups = [{ id:"A", descripcion:"A"}, { id:"B", descripcion:"B"}, { id:"C", descripcion:"C"}]
                    let factors = [{ id:true, descripcion:"SI"}, { id:false, descripcion:"NO"}]
                    let test = [{ id:"1", descripcion:"Negativo"}, { id:"2", descripcion:"Positivo"}, { id:"3", descripcion:"Pendiente"}]
                    let condicionesEgreso = [{ id:"1", descripcion:"Recuperado"}, { id:"2", descripcion:"Hospitalizado"},{ id:"4", descripcion:"Fallecido" }, { id:"3", descripcion:"No desea seguimiento" }, { id:"5", descripcion:"Va a ser seguido por otro grupo" }]
                    if(cases[0].tiempo_seguimiento > 14){
                        await req.flash("danger", "Ya tiene más de 14 días, es recomendable dar de alta al paciente.")
                    }

                    data = await getComentarios(dni_paciente);
                    let comments = data.result
                    console.log("Caso tomado :")
                    console.log(cases[0])
                    await req.useFlash(res)
                    res.render("form1", {layout: 'main1', have_this_scheduled_case, islogin:true, ...cases[0], ...data, status_patients, groups, factors, test,condicionesEgreso,comments, condicion_egreso})
                }
                else{
                    await req.flash("danger", canTake[0].message)
                    res.redirect("/dashboard")
                }
            }
        }
        else{
            await req.flash("danger", "Codigo invalido.")
            res.redirect("/dashboard")
        }
    }   
    else{
        await req.flash("danger", "Usted no ha iniciado sesión.")
        res.redirect("/")
    }
})

router.post("/case/:case",async (req, res)=>{
    const json = req.body
    json.continue_tracking =  json.continue_tracking === "on" ? true : false //Parseo de input checkbox para continuar el tracking para el dia siguiente
    if(req.session.user){
        
        let id_case = req.params.case
        let result = await getPatientForCase(id_case)
        
        result = result.result
        
        let dni_medico = req.session.user.dni
        let dni_paciente  = result[0].dni
        
        
        //Liberar caso
        if(json.tipo_guardado == "3"){
            
            await removeScheduledCase(dni_medico, dni_paciente)
            await dropCase(id_case)
            await req.flash("warning", "Caso liberado.")
            return res.redirect("/dashboard")
        }
        
        //Cerrar caso
        let data = await canTerminateCase(dni_medico, id_case)
        let canTerminate = data.result /** @return { pasa: Boolean, message: String}  Valida si puede cerrarse correctamente y si no devulve un mensaje con la razón**/
        
        if(canTerminate[0].pasa){
            let continue_tracking = json.continue_tracking
            delete json.continue_tracking
            if(continue_tracking)
                await addScheduledCase(dni_medico, dni_paciente)
            else
                await removeScheduledCase(dni_medico, dni_paciente)
            
            console.log("updateCase");
            console.log(json);
            let x = await updateCase({...json, id_caso: id_case}) //Actualizar los campos del caso
            if(json.tipo_guardado == "2"){
                
                await terminateCase(id_case, dni_medico) //Actualizar estado de caso a cerrado
                await req.flash("success", "Caso grabado y cerrado exitosamente.")
                res.redirect("/dashboard")
            }
            else{
                
                await req.flash("success", "Caso grabado exitosamente.")
                res.redirect("/dashboard")
            }
        }
        else{
            await req.flash("danger", data[0].message)
            res.redirect("/dashboard")
        }
        /***
         * Update de respuestas
         */
    }   
    else{
        await req.flash("danger", "Usted no ha iniciado sesión.")
        res.redirect("/")
    } 
})

module.exports = router
