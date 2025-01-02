
const jwt = require("jsonwebtoken");
const User = require("../database/schema/user");

const checkAuthMid = async(req,res,next)=>{

    const token = req.cookies.token;

    if(!token) return res.json({
        success: false,
      message : "Unauthrosid user!"
    })

    // console.log("token" ,token)


    try {
        const decode = jwt.verify(token , process.env.JWT_SECRET)
        const email = decode.email

        const user = await User.findOne({email})

        if(!user) return res.json({
            success: false,
          message : "Unauthrosid user!"
        })

        const existUser = {
            id : user._id,
            name : user.name,
            email : user.email,
        }

        req.user = existUser

        next()

    } catch (error) {
        console.log(error)
        return res.json({
            success : false ,
            message : "midddleware error"
           }) 
    }

}


module.exports = {checkAuthMid}