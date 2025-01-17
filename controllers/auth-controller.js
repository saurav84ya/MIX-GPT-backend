const Prompt = require("../database/schema/prompts");
const user = require("../database/schema/user");
const { getOtp, deleteOtp } = require("../middlewares/otpFunctions");

const bcrypt  = require("bcryptjs")
const jwt = require("jsonwebtoken")



const reg = async (req, res) => {
    const { name, email, password, otp } = req.body;

    // console.log("name, email, password, otp: in reg ", name, email, password, otp);

    // Check for missing fields
    if (!name || !email || !password || !otp) {
        return res.json({
            success: false,
            message: "Please fill all the fields",
        });
    }

    try {
        // Check if email already exists
        const isExist = await user.findOne({ email });
        if (isExist) {
            return res.json({
                success: false,
                message: "Email already exists",
            });
        }

        // Get OTP from storage and validate
        const storedOtp = await getOtp(email);
        if (!storedOtp || storedOtp.otp !== otp) {
            return res.json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new user({
            name,
            email,
            password: hashedPassword,
        });

        // Save the new user to the database
        await newUser.save();

        // Delete the OTP after successful registration
        await deleteOtp(email);

        // Generate a JWT token
        const token = jwt.sign(
            {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
            process.env.JWT_SECRET, // Use a secure secret from env
            { expiresIn: "1h" } // Optional: Set token expiration time
        );

        // Send the token as an HTTP-only cookie
        return res
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", // Enable secure flag in production
                sameSite: "Strict", // Prevent CSRF attacks
            })
            .status(201)
            .json({
                success: true,
                message: "Registration successful",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                },
            });
    } catch (error) {
        // console.error("Error in registration:", error);
        return res.json({
            success: false,
            message: "Internal server error",
        });
    }
};



const login = async (req,res) => {

    const {email,password} = req.body

    // console.log("email,password" ,email,password)

    if(!email || !password){
        return res.json({
            success: false,
            message: "Please provide both email and password"
        });
    }

    try {


        const isExist = await user.findOne({email})
        if(!isExist){
            return res.json({
                success: false,
                message: "User don't exist",
            });
        }

        const isValidPassword = await bcrypt.compare(password, isExist.password)
        
        // console.log("isValidPassword",isValidPassword)

        if(!isValidPassword) {
            return res.json({
                success: false,
                message: "Invailed password",
            });
        }

        const token = jwt.sign(
            {
                id: isExist._id,
                name: isExist.name,
                email: isExist.email,
            },
            process.env.JWT_SECRET, // Use a secure secret from env
            { expiresIn: "1h" } // Optional: Set token expiration time
        );


        return res
                .cookie("token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production", // Enable secure flag in production
                    sameSite: "Strict", // Prevent CSRF attacks
                })
                .json({
                    success: true,
                    message: "Login Success",
                    user: ({
                        id: isExist._id,
                        email: isExist.email,
                        name: isExist.name,
                    })
        });



        
    } catch (error) {
        // console.log(error)

        return res.json({
            success: false,
            message: "Internal Server Error",
        })
    }
}


const checkAuth = async(req,res) => {

    try {
        const user = req.user
        // console.log("user",user)
        return res.json({
            message : "You are authenticated",
            user,
            success : true
        })
        
    } catch (error) {
        return res.json({
            message : "somthing went wrong",
            success : false
        })
    }
}


const logoutUser = (req, res) => {
    // console.log("Clearing token cookie");
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/", // Make sure this matches the original cookie path
    });
    res.json({
      success: true,
      message: "Logged out successfully!",
    });
  };


  const getUserData = async(req,res) => {

    try {
        const {email} = req.params;
        console.log("user" , email)

        if(!email) {
            return res.json({
                message : "Plz provide an email",
                success : false
            })
        }

        const User = await user.findOne({email}).select('_id name email profileUrl');

        // console.log("user" , User)

        if(!User){
            return res.json({
                message : "user not found at this email",
                success : false,
            })
        }

        return res.json({
            message : "user found",
            success : true,
            user : User
        })

        
        
    } catch (error) {
        // console.log(error)

        return res.json({
            message : "somthing went wrong",
            success : false,
        })
    }
  }


  const deleteUserAccount = async (req,res) => {
    const {userId } = req.params;

    // console.log("userId",userId)

    try {
        if(!userId){
            return res.json({
                success : false,
                // message : "cant delete user Now",
                message : "Plz Provide UserID"
            })
        }

        await user.deleteOne({_id : userId})
        await Prompt.deleteMany({user : userId })

        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/", // Make sure this matches the original cookie path
          });

        res.json({
            success  : true,
            message : "Account deleted sucesfully"
        })

    } catch (error) {
        console.log("error ",error)
        res.json({
            success  : true,
            message : "Account deleted sucesfully"
        })
    }

  }
  

module.exports = {reg,login,checkAuth,deleteUserAccount,getUserData ,logoutUser}