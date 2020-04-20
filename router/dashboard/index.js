const { Router } = require("express")
const router = Router()

router.get("/", (req, res)=>{
    res.send("dashboard")
})


module.exports = router