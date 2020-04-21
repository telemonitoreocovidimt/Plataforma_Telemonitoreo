const express = require("express")
const path = require("path")
const app = express()
const session = require('express-session')
const { KEY_SECRET, PORT } = require("./config")
const formData = require("express-form-data");
const os = require("os");

const options = {
  uploadDir: os.tmpdir(),
  autoClean: true
};

app.use(formData.parse(options));
app.use(formData.format());
app.use(formData.stream());
app.use(formData.union());

app.use(express.urlencoded({extended:true}))

app.use(express.json())

app.use(express.static(path.join(__dirname, "public")))

app.use(session({
    secret: KEY_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

app.use(require("./router/account/index"))

app.use("/dashboard", require("./router/dashboard/index"))

app.use("/load-excel", require("./router/loadExcel/index"))

app.listen( 3000 || PORT)