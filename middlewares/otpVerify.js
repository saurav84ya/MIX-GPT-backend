const { getOtp, deleteOtp } = require("./otpFunctions");

const otpVerify = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email or OTP is missing",
      });
    }

    const storedOtp = await getOtp(email);
    // console.log("Stored OTP:", storedOtp);

    if (!storedOtp) {
      return res.status(404).json({
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
      return res.status(400).json({
        success: false,
        message: "Invalid OTP, please try again",
      });
    }
  } catch (error) {
    // console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP due to a server error",
    });
  }
};

module.exports = { otpVerify };
