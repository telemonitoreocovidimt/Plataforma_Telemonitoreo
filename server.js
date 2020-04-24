const express = require("express")
const path = require("path")
const app = express()
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const morgan = require("morgan")
const { PORT } = require("./config")
const formData = require("express-form-data");
const exphbs = require("express-handlebars")
const cookieParser = require('cookie-parser')
const { pool } = require("./model/connection")
const randomString = require("randomstring")
const os = require("os");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const options = {
  uploadDir: os.tmpdir(),
  autoClean: true
};

app.use(formData.parse(options));
app.use(formData.format());
app.use(formData.stream());
app.use(formData.union());


app.use(cookieParser());

app.use(session({
    name: 'SID',
    secret: randomString.generate({
        length: 14,
        charset: 'alphanumeric'
    }),
    store: new pgSession({
        pool: pool,
        tableName: 'session',
        schemaName: 'development'
    }),
    resave: true,
    saveUninitialized: true
}))

app.use(require('flash')());

app.use(express.urlencoded({extended:true}))

app.use(express.json())

app.use(morgan("dev"))

app.use(express.static(path.join(__dirname, "public")))

app.set("views", path.join(__dirname, "views"))

app.engine(".hbs", exphbs.create({
    defaultLayout: 'main',
    partialsDir: path.join(app.get("views"), "partials"),
    layoutsDir: path.join(app.get("views"), "layouts"),
    extname: ".hbs"
}).engine)

app.set("view engine", ".hbs")

app.use(require("./router/account/index"))

app.use("/dashboard", require("./router/dashboard/index"))

app.use("/load-excel", require("./router/loadExcel/index"))

app.use("/api/v1/", require("./router/api/index"))

app.listen( PORT || 3000)
