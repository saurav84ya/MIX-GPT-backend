const mongoose = require("mongoose")

const dbConnect = async () => {
    try {

        await mongoose.connect(process.env.MONGODB_URI);
            console.log("Connected to MongoDB");

    } catch (error) {
        console.log("database connection failed")
    }
}

module.exports = dbConnect;