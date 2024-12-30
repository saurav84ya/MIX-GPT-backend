

const {Schema ,model} = require("mongoose")

const userSchema = new Schema ({
    name : {
        type : String,
        require : true
    },
    email : {
        type : String,
        require : true
    },
    password : {
        type : String,
        require : true
    },
    conversation : {
        type : Array,
        default : []
    },
    profileUrl : {
        type : String,
        default : null
    }
})

const user = model("AiUser" , userSchema);

module.exports = user