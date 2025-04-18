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


const groq = new Groq({
    apiKey: process.env.API_KEY_LAMA,
});

const getResponseLlama = async (prompt) => {
    const messages = [{ role: "user", content: prompt }];

    try {
        

        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "llama-3.3-70b-versatile",
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false, // Change to true if you want streaming responses
            stop: null,
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error("Error:", error);
    }
};


const getResponseDeepSeek = async (prompt) => {
    const messages = [{ role: "user", content: prompt }];

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: "deepseek-r1-distill-llama-70b",
            temperature: 0.6,
            max_completion_tokens: 4096,
            top_p: 0.95,
            stream: false, // Change to true if you want streaming responses
            stop: null,
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error("Error:", error);
    }
};



const getResponseGemma = async (prompt) => {

    try {

        const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: 'user', content: prompt },
              { role: 'assistant', content: 'Hello! 👋 How can I help you today?' },
            ],
            model: 'gemma2-9b-it', // Model name (can be dynamic if required)
            temperature: 1,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: true, // For streaming responses
            stop: null,
          });
      
          let responseText = '';
      
          // Collect streaming chunks and assemble the final response
          for await (const chunk of chatCompletion) {
            responseText += chunk.choices[0]?.delta?.content || '';
          }
      
          // Send the full response back to the client
         return responseText
    } catch (error) {
        
    }
}




const unAuthPrompts = async(req,res) => {
    const {prompt} = req.body;
    if(!prompt) {
        return res.json({
            success : false,
            message : "Please enter a prompt"
        })
    }
    try {

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



const authPrompts = async (req, res) => {
    const { email, prompt, model } = req.body;

    if (!email || !prompt || !model) {
        return res.json({
            success: false,
            message: "Please enter email, prompt, and model",
        });
    }

    try {
        const isExist = await user.findOne({ email });

        if (!isExist) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        let responseText;

        if (model === "gemini") {
            const response = await getResponse(prompt);
            responseText = response.response.candidates[0].content.parts[0].text;
        } else if (model === "gemma2") {
            responseText = await getResponseGemma(prompt);
        } else if (model === "llama") {
            responseText = await getResponseLlama(prompt);
        } else if (model === "deepseek") {
            responseText = await getResponseDeepSeek(prompt)
        }else {
            return res.json({
                success: false,
                message: "Invalid model specified",
            });
        }


        const newPrompt = new Prompt({
            prompt,
            answer: responseText,
            user: isExist._id,
            model,
        });

        const savedPrompt = await newPrompt.save();
        isExist.conversation.push(savedPrompt._id);
        await isExist.save();

        return res.json({
            success: true,
            message: `Response from ${model}`,
            response: responseText,
            promptId: savedPrompt._id,
        });

    } catch (error) {
        return res.json({
            success: false,
            message: "Error occurred while processing your request",
        });
    }
};


const getPrompts = async(req,res) => {
        const {userId} = req.params;

    try {

        

        const prompts = await Prompt.find({user : userId}).select("prompt") || []

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


        return res.json({
            success: true,
            promptAns: promptAns
        })

        

        
    } catch (error) {
        
    }
}


const deletePromptHistory = async(req,res) => {

    const { userId, promptId} = req.params


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
        return res.json({
            success: false,
            message: "can't delete now"
        })
    }
}

const deleteAllPrompt = async (req,res) => {
    const {userId} = req.params;

try {

    

    await Prompt.deleteMany({user : userId})

        

    return res.json({
        success: true,
        message : "deleted succesfull"
    });


    
} catch (error) {
    return res.json({
        success: false,
        message: "Error occurred while fetching prompts",
    });
}

}

module.exports = {authPrompts,unAuthPrompts ,deletePromptHistory, getPrompts,deleteAllPrompt,getPromptAns}