const { setOtp } = require("./otpFunctions");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const user = require("../database/schema/user");

const sentOtp = async (req, res) => {
    const {email}  = req.params;

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required",
        });
    }

    try {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({
                success: false,
                message: "Invalid email format",
            });
        }

        const isExist = await user.findOne({email})

        if(!isExist){
            return res.json({
                success: false,
                message: "User don,t exist"
            });
        }
        

        const otp = crypto.randomInt(100000, 999999).toString();
        // console.log("email",email)
        await setOtp(email, otp);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: "MIX GPT",
            to: email,
            subject: "Your OTP for Registration",
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json({
                success: true,
                message: "OTP has been sent to your email",
            });
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            return res.json({
                success: false,
                message: "Failed to send OTP email",
            });
        }


    } catch (e) {
        console.error("Error in sentOtp:", e); // Enhanced logging
        return res.json({
            success: false,
            message: "Something went wrong"
        });
    }
};


const sentOtpReg = async (req, res) => {
    const {email}  = req.params;

    if (!email) {
        return res.json({
            success: false,
            message: "Email required",
        });
    }

    try {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.json({
                success: false,
                message: "Invalid email format",
            });
        }

        const isExist = await user.findOne({email})

        if (isExist) {
            return res.json({
                success: false,
                message: "Email already exist",
            });
        }
        

        const otp = crypto.randomInt(100000, 999999).toString();
        // console.log("email",email)
        await setOtp(email, otp);

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: "MIX GPT",
            to: email,
            subject: "Your OTP for Registration",
            text: `Your OTP is ${otp}. It will expire in 5 minutes.`
        };

        try {
            await transporter.sendMail(mailOptions);
            return res.status(200).json({
                success: true,
                message: "OTP has been sent to your email",
            });
        } catch (emailError) {
            console.error("Error sending email:", emailError);
            return res.json({
                success: false,
                message: "Failed to send OTP email",
            });
        }


    } catch (e) {
        console.error("Error in sentOtp:", e); // Enhanced logging
        return res.json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports = {sentOtp , sentOtpReg};
