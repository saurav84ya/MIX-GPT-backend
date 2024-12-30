const user = require("../database/schema/user");
const bcryptjs = require("bcryptjs");
const { deleteOtp, getOtp } = require("../middlewares/otpFunctions");

const newPass = async (req, res) => {
  const { email, password, otp } = req.body;

  try {
    if (!email || !password || !otp) {
       return res.json({
        success: false,
        message: "missing required fields",
      });
    }

    const isExist = await user.findOne({ email });

    if (!isExist) {
       return  res.json({
        success: false,
        message: "user dont exist",
      });
    }

    const storedOtp = await getOtp(email);

    if (!storedOtp || storedOtp.otp !== otp) {
        return res.json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      await deleteOtp(email);

      const hashedPassword = await bcryptjs.hash(password, 10);

      const updatedUser = await user.findOneAndUpdate(
        { email: email },
        { $set: { password: hashedPassword } },
        { new: true }
      );
  
      if (!updatedUser) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Password updated successfully!",
      });

  } catch (error) {
    console.log(error)
     return res.json({
      success: false,
      message: "Internal server error.",
    });
  }
};

module.exports = { newPass };
