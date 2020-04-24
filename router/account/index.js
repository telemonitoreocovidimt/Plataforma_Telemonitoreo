const { Router } = require("express")
const { login } = require("./../../model/account")
const router = Router()

router.get("/", (req, res)=>{
    if(req.session.user){
        return res.redirect("/dashboard")
    }
    else{
        res.render("login", { title: "Login"})
    }
})

router.post("/",async (req, res)=>{
    
    let body = req.body
    if(body.email && body.password){
        let result = await login(body.email, body.password)
        if(result.length){
            req.flash("success", `Bienvenido ${result[0].nombre}.`)
            req.session.user = result[0]
            res.redirect("/dashboard")
        }
        else{
            req.flash("danger", "Correo o password incorrectos. Usuario no encontrado.")
            res.render("login", { title: "Login"})
        }
    }
    else{
        req.flash("danger", "Parametros invalidos.")
        res.render("login", { title: "Login"})
    }
})

router.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });

});

module.exports = router