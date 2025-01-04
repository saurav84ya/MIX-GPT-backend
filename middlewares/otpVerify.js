const { getOtp, deleteOtp } = require("./otpFunctions");

const otpVerify = async (req, res) => {
  const { email, otp } = req.body;

  console.log("email, otp " , email, otp )
  try {
    if (!email || !otp) {
      return res.json({
        success: false,
        message: "Email or OTP is missing",
      });
    }

    const storedOtp = await getOtp(email);
    // console.log("Stored OTP:", storedOtp);

    if (!storedOtp) {
      return res.json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    if (storedOtp.otp === otp) {
    //   await deleteOtp(storedOtp.email);
      return res.status(200).json({
        success: true,
        message: "OTP verified",
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid OTP, please try again",
      });
    }
  } catch (error) {
    // console.error("Error verifying OTP:", error);
    return res.json({
      success: false,
      message: "Unable to verify OTP due to a server error",
    });
  }
};

module.exports = { otpVerify };
