const os = require('os');
const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const PGSession = require('connect-pg-simple')(session);
const morgan = require('morgan');
const formData = require('express-form-data');
const exphbs = require('express-handlebars');
const {pool} = require('./model/connection');
const {PORT, PGSCHEMA, KEY_SECRET} = require('./config');
const {runJobs} = require('./timers');

// Ejecutar los Jobs
runJobs();

// Log para desarrollo
app.use(morgan('dev'));

// Configuración para la carga de documentos
const options = {
  'uploadDir': os.tmpdir(),
  'autoClean': true,
};
app.use(formData.parse(options));
app.use(formData.format());
app.use(formData.stream());
app.use(formData.union());

// Agregando middleware para acceder al req.body
app.use(express.urlencoded({'extended': false}));
app.use(express.json());

// Configurando manejo de sesiones
app.use(session({
  'secret': KEY_SECRET,
  'store': new PGSession({
    'pool': pool,
    'tableName': 'session',
    'schemaName': PGSCHEMA,
  }),
  'resave': false,
  'cookie': {
    'maxAge': 1000 * 60 * 60 * 24 * 30,
  },
}));

// Agregando middleware para el uso de flash custom
app.use(require('./middleware/flash')());

// Configuración de archivos estaticos.
app.use(express.static(path.join(__dirname, 'public')));

// Configurandor motor de renderizdo Handlebars
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.create({
  'defaultLayout': 'main',
  'partialsDir': path.join(app.get('views'), 'partials'),
  'layoutsDir': path.join(app.get('views'), 'layouts'),
  'extname': '.hbs',
  'helpers': {
    'equal': (v1, v2, v)=>{
      return v1 == v2;
    },
    'compare': (v1, v2, v)=>{
      return v1 == v2 ? v : '';
    },
    'generate': (v)=>{
      let text = '';
      for (let i = 0; i < v; i++) {
        text+='*';
      }
      return text;
    },
    'dateToString': (d)=>{
      if (d != null) {
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();
        if (month.length < 2) {
          month = '0' + month;
        }
        if (day.length < 2) {
          day = '0' + day;
        }
        return [year, month, day].join('-');
      }
      return '';
    },
  },
}).engine);
app.set('view engine', '.hbs');

// Rutas de inicio de sessión
app.use(require('./router/account'));

// Rutas de vistas extras.
app.use('/landing', require('./router/landing'));

// Rutas del dashbaord.
app.use('/dashboard', require('./router/dashboard'));

// Rutas del administrador.
app.use('/admin', require('./router/admin'));

// Rutas para reportes
app.use('/report', require('./router/report'));

// Rutas de apis
app.use('/api/v1/', require('./router/api'));

// Rutas de seguimiento por vacunas anti COVID
app.use('/vacuna', require('./router/vaccine'));

app.listen(PORT, ()=>{
  console.log(`Server on port ${PORT}`);
});
