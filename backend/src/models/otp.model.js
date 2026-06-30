const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, "Email is required"]
    },
    username: {
        type: String,
        required: [true, "Username is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        default: "user"
    },
    otpHash:{
        type: String,
        required: [true, "OTP hash is required"]
    }
},{
    timestamps: true
})

const otpModel = mongoose.model("otp",otpSchema)

module.exports = otpModel;