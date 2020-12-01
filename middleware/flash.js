const assert = require('assert');

module.exports = function() {
  return async function(req, res, next) {
    // Validar si existe una session
    assert(req.session, 'a req.session is required!');
    // Existe el atributo flash en la sesión,
    // si no se crea por primera vez el objeto en sessión;
    if (!Array.isArray(req.session.flash)) {
      req.session.flash = [];
    }
    req.session.flash = req.session.flash.filter((x) => !x.used);
    // Agregar funcion para "Agregar flash"
    req.flash = push;
    req.useFlash = use;
    // Seguir con request
    req.session.save(()=>{
      next();
    });
  };
};

/**
 * Agregar un mensaje Flash
 * @function
 * @param {String} type Tipo de flask ('info', 'warning', etc) Bootstrap ref.
 * @param {String} msg Mensaje que se enviara.
 * @return {Promise}
 */
function push(type, msg) {
  return new Promise(async (resolve, reject)=>{
    // Validar default si llega solo un parametor
    if (!msg) {
      msg = type;
      type = 'info';
    }
    // Json schema de flash
    msg = {
      'used': false,
      'message': msg,
      'type': type,
    };
    // Recuperar contexto de RES
    const req = this.req || this;

    // agregar flash a respuesta
    req.session.flash.push(msg);
    // Agregar flash a session
    req.session.save(()=>{
      return resolve();
    });
  });
}

/**
 * Agregar mensajes Flask a "Local".
 * Con esto podremos usar todos los flask almacenados para
 * imprimirlos en las vistas usando la variable "flash"
 * @function
 * @param {Object} res
 * @return {Promise}
 */
function use(res) {
  return new Promise(async (resolve, reject)=>{
    const req = this.req || this;
    req.session.flash = await Promise.all(req.session.flash.map((item, index)=>{
      item['used'] = true;
      return item;
    }));
    req.session.save(()=>{
      res.locals.flash = req.session.flash;
      resolve();
    });
  });
};
