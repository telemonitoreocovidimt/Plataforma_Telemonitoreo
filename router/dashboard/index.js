const { Router } = require("express")
const router = Router()
const { getPatientsAlert, getPatients, countAllCaseToday, countAllCaseAttendedToday,
     countAllCaseAttendedToDayForDoctor, countAllCaseAttendedToDayBetweenDoctors, takeCase, canTakeCase,
     getStatusPatients, canTerminateCase, terminateCase, getMyPatients, getCase } = require("./../../model/dashboard")

router.get("/",async (req, res)=>{
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
            sum+=json.count
        })

        let cases_attented_promean = 0;
        if ( count && sum ){
            cases_attented_promean = parseInt(sum/count)
        }
        
        res.render("dashboard", { 
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
        res.redirect("/")
    }
})

router.get("/case/:case",async (req, res)=>{
    console.log(typeof(req.params.case))
    console.log(req.params.case)
    req.params.case = parseInt(req.params.case)
    if(req.session.user){
        if(req.params.case){
            if (typeof(req.params.case) != 'number'){
                res.redirect("/dashboard")
            }
            else{
                let id_case = req.params.case
                let dni_medico = req.session.user.dni
                let data = await canTakeCase(dni_medico, id_case)
                let canTake = data.result
                if(canTake[0].pasa){
                    data = await takeCase(id_case, dni_medico, true)
                    let taked = data.result
                    console.log(taked)
                    data = await getCase(id_case, true, data.client)
                    console.log(data)
                    let cases = data.result
                    data = await getStatusPatients(false, data.client)
                    let status_patients = data.result
                    let groups = [{ id:"A", descripcion:"A"}, { id:"B", descripcion:"B"}, { id:"C", descripcion:"C"}]
                    let factors = [{ id:true, descripcion:"SI"}, { id:false, descripcion:"NO"}]
                    let test = [{ id:"Positivo", descripcion:"Positivo"}, { id:"Negativo", descripcion:"Negativo"}]
                    // res.json(cases)

                    res.render("form",{layout: 'case',islogin:true,...data, status_patients, groups, factors, test})
                }
                else{
                    req.flash("danger", data[0].message)
                    res.redirect("/dashboard")
                }
            }
        }
        else{
            res.redirect("/dashboard")
        }
    }   
    else{
        res.redirect("/")
    } 
})

router.post("/:case/completed",async (req, res)=>{
    if(req.session.user){
        let id_case = req.params.case
        let dni_medico = req.session.user.dni
        let canTerminate = await canTerminateCase(dni_medico, id_case)
        console.log(canTerminate)
        /***
         * Update de respuestas
         */
        let json = req.boby
        await updateCase()
        await terminateCase(id_case, dni_doctor)
        res.json(cases)
    }   
    else{
        res.redirect("login")
    } 
})

module.exports = router
