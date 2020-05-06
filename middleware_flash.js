
var assert = require('assert')

module.exports = function () {
  return function (req, res, next) {
    //Validar si existe una session
    assert(req.session, 'a req.session is required!')
    //Existe el atributo flash en la sessio, si no se crea por primera vez el objeto en sessión 
    if (!Array.isArray(req.session.flash)) req.session.flash = []
    
    req.session.flash = req.session.flash.filter( x => !x.used)
   
    //Agregar funcion para "Agregar flash"
    req.flash = push
    req.useFlash = use
    //Seguir con request
    req.session.save(()=>{
        next()
    })
  }
}

function push(type, msg) {
    return new Promise((resolve,reject)=>{
    
        //Validar default si llega solo un parametor
        if (!msg) {
            msg = type
            type = 'info'
        }

        //Json schema de flash
        msg = {
            used:false,
            message: msg,
            type: type
        }

        //Recuperar contexto de RES
        var req = this.req || this

        //Obtener todos flash en local
        var messages = req.session.flash

        // do not allow duplicate flash messages
        for (var i = 0; i < messages.length; i++) {
            var message = messages[i]
            if (msg.type === message.type && msg.message === message.message) return this
        }

        //agregar flash a respuesta
        req.session.flash.push(msg)

        //Agregar flash a session
        req.session.save(()=>{
            resolve()
        })
    })
}

function use(res){
    return new Promise((resolve, reject)=>{
        var req = this.req || this
        res.locals.flash = []
        for(let i = 0; i < req.session.flash.length; i++){
            req.session.flash[i]["used"] = true
            res.locals.flash.push(req.session.flash[i])
        }
        req.session.save(()=>{
            resolve()
        })
    })
}