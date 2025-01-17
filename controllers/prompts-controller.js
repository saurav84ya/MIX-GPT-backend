const { GoogleGenerativeAI } = require("@google/generative-ai");
const user = require("../database/schema/user");
const Prompt = require("../database/schema/prompts")

const Groq = require("groq-sdk");


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


const getResponseLama = async (prompt) => {
    const messages = [{ role: "user", content: prompt }];

    try {
        const groq = new Groq({
            apiKey: process.env.API_KEY_LAMA,
        });

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false, // Change to true if you want streaming responses
            stop: null,
        });

        console.log("Chat Response:", chatCompletion.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error);
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
    const {email,prompt } = req.body;

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

    // console.log("userId, promptId" , userId, promptId)

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


const deletePromptHistory = async(req,res) => {

    const { userId, promptId} = req.params

    // console.log("userId, promptId" , userId, promptId)

    if(!userId || !promptId) {
        return res.json({
            success: false,
            message: "Missing required parameters"
            })
    }

    try {


          await Prompt.findByIdAndDelete({_id : promptId ,user:userId  })
        

        
        return res.json({
            success: true,
            message: "prompt deleted succesfully"
        })
        
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: "can't delete now"
        })
    }
}

const deleteAllPrompt = async (req,res) => {
    const {userId} = req.params;

    // console.log("userId" ,userId)
try {

    
    // const prompts = await Prompt.find({user : userId}).populate('user').populate('conversation')

    await Prompt.deleteMany({user : userId})
    // console.log("prompts",prompts)

        

    return res.json({
        success: true,
        message : "deleted succesfull"
    });


    
} catch (error) {
    // console.error("Error fetching prompts:", error);
    return res.json({
        success: false,
        message: "Error occurred while fetching prompts",
    });
}

}

module.exports = {authPrompts,unAuthPrompts ,deletePromptHistory, getPrompts,deleteAllPrompt,getPromptAns}