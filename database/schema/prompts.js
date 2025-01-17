const {Schema , model} = require("mongoose")

const promptSchima = new Schema({
    prompt: {type: String, required: true},
    answer: { type: String, required: true }, 
    model : {type : String},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    created_at: {type: Date, default: Date.now},
    updated_at: {type: Date, default: Date.now}
})


const Prompt = model("AiPrompts" , promptSchima )

module.exports = Prompt