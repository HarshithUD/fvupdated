const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OtpSchema = new Schema({
    number: {
        type: String,
        required: true
    },
    otp:{
        type: Number,
        required: true
    },
    type:{
        type: String,
        required: true
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = otp = mongoose.model("otpData",OtpSchema);