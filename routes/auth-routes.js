const { reg, login } = require("../controllers/auth-controller")
const { sentOtpReg } = require("../middlewares/otpSender")

const express = require("express")

const router = express.Router()


router.get("/getOtp/:email" , sentOtpReg)

router.post("/reg",reg)
router.post("/login",login)



module.exports = router