const {sentOtp} = require("../middlewares/otpSender")
const { otpVerify } = require("../middlewares/otpVerify")
const { newPass } = require("../utils/utilsFunctions")

const router = require("express").Router()


router.get('/otp/:email' , sentOtp)
router.post('/otpVerify' , otpVerify)
router.post('/newPAss' , newPass)









module.exports = router