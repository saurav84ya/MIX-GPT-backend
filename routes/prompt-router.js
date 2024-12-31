const express = require("express")
const { unAuthPrompts, authPrompts,getPrompts,getPromptAns } = require("../controllers/prompts-controller")

const router = express.Router()



router.post('/unAuth' , unAuthPrompts)
router.post('/auth' , authPrompts)
router.get('/getPrompts/:userId' , getPrompts)
router.get('/getPromptAns/:userId/:promptId' , getPromptAns)



module.exports = router