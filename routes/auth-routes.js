const { reg, login ,checkAuth,logoutUser,getUserData,deleteUserAccount} = require("../controllers/auth-controller")
const { updateUserName,updateEmail } = require("../controllers/userUpdate-controller")
const { checkAuthMid } = require("../middlewares/checkAuth")
const { sentOtpReg } = require("../middlewares/otpSender")

const express = require("express")

const router = express.Router()


router.get("/getOtp/:email" , sentOtpReg)
router.get("/getUserData/:email" , getUserData)

router.post("/reg",reg)
router.post("/login",login)



router.get("/checkAuth",checkAuthMid ,checkAuth)

router.post("/logout" , logoutUser)

router.delete("/deleteUserAccount/:userId" , deleteUserAccount)

router.post("/updateUserName",updateUserName)
router.post("/updateUserEmail",updateEmail)



module.exports = router