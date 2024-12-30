const OtpModel = require("../database/schema/otp");

const deleteOtp = async (email) => {
  try {
    await OtpModel.findOneAndDelete({ email });
  } catch (err) {
    console.error("Error deleting OTP:", err);
  }
};

const getOtp = async (email) => {
  try {
    const otpEntry = await OtpModel.findOne({ email }); // Renamed variable
    return otpEntry;
  } catch (err) {
    console.error("Error retrieving OTP:", err);
    return null;
  }
};

const setOtp = async (email, otp) => {

    console.log("email, otp" ,email, otp)
  try {
    const newOtp = new OtpModel({
      email : email,
      otp: otp, // Renamed parameter for clarity
    });

    await newOtp.save();
    console.log("OTP stored successfully");
  } catch (err) {
    console.error("Error storing OTP:", err);
  }
};

module.exports = { deleteOtp, setOtp, getOtp };
