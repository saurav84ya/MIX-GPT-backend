const user = require("../database/schema/user");
const { getOtp } = require("../middlewares/otpFunctions");

const updateUserName = async (req, res) => {
    try {
        const { id, newName } = req.body.formData; // Ensure correct destructuring

        if (!id || !newName) {
            return res.json({
                success: false,
                message: "Something is missing",
            });
        }

        const userUpdate = await user.findById(id); // Use `findById`

        if (!userUpdate) {
            return res.json({
                success: false,
                message: "User may not exist",
            });
        }

        await user.findByIdAndUpdate(id, { name: newName });

        return res.json({
            success: true,
            message: "Username updated successfully",
        });

    } catch (error) {
        console.error(error); // Log error for debugging
        return res.json({
            success: false,
            message: "Something went wrong",
        });
    }
};

const updateEmail = async (req, res) => {
    try {
        const { id, email, otp } = req.body.formData; // Ensure correct destructuring

        if (!id || !email || !otp) {
            return res.json({
                success: false,
                message: "Please provide all fields",
            });
        }

        const updateUser = await user.findById(id);
        if (!updateUser) {
            return res.json({
                success: false,
                message: "User may not exist",
            });
        }

        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.json({
                success: false,
                message: "User with this email already exists",
            });
        }

        const otpOnServer = await getOtp(email);``

        if (!otpOnServer) {
            return res.json({
                success: false,
                message: "OTP doesn't exist or may have expired",
            });
        }


        if (otpOnServer.otp === otp) {
            await user.findByIdAndUpdate(id, { email });


            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/", // Make sure this matches the original cookie path
              });

            return res.json({
                success: true,
                message: "Email updated successfully. Please log in again using the new email.",
            });
        }

        return res.json({
            success: false,
            message: "Invalid OTP",
        });

    } catch (error) {
        console.error(error);
        return res.json({
            success: false,
            message: "Something went wrong",
        });
    }
};


module.exports ={updateUserName,updateEmail}