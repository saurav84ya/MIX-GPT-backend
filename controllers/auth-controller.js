const user = require("../database/schema/user");
const { getOtp, deleteOtp } = require("../middlewares/otpFunctions");

const bcrypt  = require("bcryptjs")
const jwt = require("jsonwebtoken")



const reg = async (req, res) => {
    const { name, email, password, otp } = req.body;

    // console.log("name, email, password, otp:", name, email, password, otp);

    // Check for missing fields
    if (!name || !email || !password || !otp) {
        return res.status(400).json({
            success: false,
            message: "Please fill all the fields",
        });
    }

    try {
        // Check if email already exists
        const isExist = await user.findOne({ email });
        if (isExist) {
            return res.status(409).json({
                success: false,
                message: "Email already exists",
            });
        }

        // Get OTP from storage and validate
        const storedOtp = await getOtp(email);
        if (!storedOtp || storedOtp.otp !== otp) {
            return res.status(400).json({
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
        console.error("Error in registration:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};



const login = async (req,res) => {

    const {email,password} = req.body

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
        
        console.log("isValidPassword",isValidPassword)

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
        console.log(error)

        return res.json({
            success: false,
            message: "Internal Server Error",
        })
    }
}

module.exports = {reg,login}