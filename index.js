require("dotenv").config()

const express = require("express")
const dbConnect = require("./database/db")
const cookieParser = require("cookie-parser");
const app = express()





const PORT = process.env.PORT || 4000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



app.get("/" , (req,res) => {
    res.json({
        meaasge : "Hello from eorld"
    })
})

const recpovery = require("./routes/recoveryPass")
const auth = require("./routes/auth-routes")
const ai = require("./routes/prompt-router")

app.use("/rec" ,recpovery )
app.use("/auth" ,auth )
app.use("/ai" , ai)


dbConnect()
    .then(()=>{
        app.listen(PORT , ()=> {
            console.log(`server is running at ${PORT}`)
        })        
})












