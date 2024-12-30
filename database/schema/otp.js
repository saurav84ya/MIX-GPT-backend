const { Schema, model } = require("mongoose");

const otpSchema = new Schema({
  email: {
    type: String,
    required: true, // Fixed typo 'require' -> 'required'
  },
  otp: {
    type: String,
    required: true, // Fixed typo 'require' -> 'required'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // 300 seconds = 5 minutes (time-to-live)
  },
});

// Rename the model variable to avoid naming conflicts
const OtpModel = model("AiOtp", otpSchema);

module.exports = OtpModel;
