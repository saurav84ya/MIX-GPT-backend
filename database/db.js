const mongoose = require("mongoose")

const dbConnect = async () => {
    try {

        await mongoose.connect(process.env.MONGODB_URI);

    } catch (error) {
    }
}

module.exports = dbConnect;