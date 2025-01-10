



require("dotenv").config()


const express = require('express');

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.listen(4000, () => {
    console.log("Server connected on port 4000");
});
