const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const PGSession = require('connect-pg-simple')(session);
const morgan = require('morgan');
const {PORT, PGSCHEMA, KEY_SECRET} = require('./config');
const formData = require('express-form-data');
const exphbs = require('express-handlebars');
const {pool} = require('./model/connection');
const os = require('os');
const {makeMigrations} = require('./model/migration');

const {runJobs} = require('./timers');
runJobs();

const options = {
  uploadDir: os.tmpdir(),
  autoClean: true,
};

app.use(formData.parse(options));
app.use(formData.format());
app.use(formData.stream());
app.use(formData.union());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
  secret: KEY_SECRET,
  store: new PGSession({
    pool: pool,
    tableName: 'session',
    schemaName: PGSCHEMA,
  }),
  resave: false,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},
}));

app.use(require('./middleware/flash')());

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

app.engine('.hbs', exphbs.create({
  defaultLayout: 'main',
  partialsDir: path.join(app.get('views'), 'partials'),
  layoutsDir: path.join(app.get('views'), 'layouts'),
  extname: '.hbs',
  helpers: {
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
        var month = '' + (d.getMonth() + 1),
          day = '' + d.getDate(),
          year = d.getFullYear();

          if (month.length < 2) 
              month = '0' + month;
          if (day.length < 2) 
              day = '0' + day;

          return [year, month, day].join('-');
      }
      return ""
      
  }
}}).engine);
app.set('view engine', '.hbs');


app.get('/routine', (req, res)=>{
  makeMigrations();
  res.json({'success': 'ok'});
});

app.use('/landing', require('./router/landing'));
app.use(require('./router/account'));
app.use('/dashboard', require('./router/dashboard'));
app.use('/admin', require('./router/admin'));
app.use('/api/v1/', require('./router/api'));

app.listen(PORT, ()=>{
  console.log(`Server on port ${PORT}`);
});
