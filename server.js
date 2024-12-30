require("dotenv").config()


const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.post('/',  async(req, res) => {
            const {prompt} = req.body;

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const result = await model.generateContent(prompt);
// console.log(result.response.text());

    res.json({
        data : result
    })
});

app.listen(4000, () => {
    console.log("Server connected on port 4000");
});
