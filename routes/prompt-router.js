const express = require("express")
const { unAuthPrompts, authPrompts,getPrompts,getPromptAns,deletePromptHistory } = require("../controllers/prompts-controller")

const router = express.Router()



router.post('/unAuth' , unAuthPrompts)
router.post('/auth' , authPrompts)



router.get('/getPrompts/:userId' , getPrompts)
router.get('/getPromptAns/:userId/:promptId' , getPromptAns)

router.delete('/deletePromptHistory/:userId/:promptId' , deletePromptHistory)



module.exports = router