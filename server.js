const express = require("express")
const path = require("path")
const app = express()
const session = require('express-session')
const { KEY_SECRET, PORT } = require("./config")

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

app.listen( 3000 || PORT)