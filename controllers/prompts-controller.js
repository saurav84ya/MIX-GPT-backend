const { GoogleGenerativeAI } = require("@google/generative-ai");
const user = require("../database/schema/user");
const Prompt = require("../database/schema/prompts")


const getResponse = async (prompt) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        return result;
    } catch (error) {
        console.error("Error in getResponse:", error);
        throw new Error("Failed to generate response from AI");
    }
};

const unAuthPrompts = async(req,res) => {
    const {prompt} = req.body;
    if(!prompt) {
        return res.json({
            success : false,
            message : "Please enter a prompt"
        })
    }
    try {
        console.log("prompt",prompt)

        const resonse = await getResponse(prompt);

        return res.json({
            success : true,
            message : "Response from Google Generative AI",
            response : resonse.response
        })
        
    } catch (error) {
        return res.json({
            success : false,
            message : "Error occurred while generating response",
        })
        
    }
} 



const authPrompts = async(req,res) => {
    const {email,prompt} = req.body;

    // console.log("email,prompt" ,email,prompt)

    if(!email || !prompt){
         return res.json({
            success : false,
            message : "Please enter email and prompt"
        })
    }
    try {

        const isExist = await user.findOne({email})

        if(!isExist){
            return res.json({
                success : false,
                message : "User not found"
            })
        }

        const response = await getResponse(prompt);

        const newPrompt = new Prompt({
            prompt , 
            answer : response.response ,
            user : isExist._id ,
        })

        const savedPrompt = await newPrompt.save();
        isExist.conversation.push(savedPrompt._id)
        await isExist.save()

        return res.json({
            success : true,
            message : "Response from Google Generative AI",
            response : response.response,
            promptId : savedPrompt._id
            })
        
    } catch (error) {
        console.log("error" ,error)
        return res.json({
            success : false ,
            message : "Error occurred while processing your request"
            })
    }
} 

const getPrompts = async(req,res) => {
        const {userId} = req.params;

        // console.log("userId" ,userId)
    try {

        
        // const prompts = await Prompt.find({user : userId}).populate('user').populate('conversation')

        const prompts = await Prompt.find({user : userId}).select("prompt") || []
        // console.log("prompts",prompts)

            if(!prompts){
                return res.json({
                    success : false ,
                    message : "No prompts found"
                    })
            }   

        return res.json({
            success: true,
            prompts: prompts, // Extract only prompt values
        });


        
    } catch (error) {
        // console.error("Error fetching prompts:", error);
        return res.json({
            success: false,
            message: "Error occurred while fetching prompts",
        });
    }
}


const getPromptAns = async(req,res) => {

    const { userId, promptId} = req.params

    if(!userId || !promptId) {
        return res.json({
            success: false,
            message: "Missing required parameters"
            })
    }

    try {

        const promptAns = await Prompt.find({user : userId , _id : promptId})

        console.log(promptAns)

        return res.json({
            success: true,
            promptAns: promptAns
        })

        

        
    } catch (error) {
        
    }
}

module.exports = {authPrompts,unAuthPrompts , getPrompts,getPromptAns}