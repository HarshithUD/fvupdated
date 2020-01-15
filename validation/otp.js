const Validator = require('validator')
const isEmpty = require('is-empty')

module.exports = function validateOtp(data){
    let errors = {};

    // //Convert Empty fields to an empty String to use validator functions
    // data.otp = !isEmpty(data.otp)?data.otp: "";

    // if(!Validator.isLength(data.otp,{min: 4,max: 4})){
    //     errors.otpNo = "Otp should be 4 digit";
    // }

    return {
        errors,
        isValid:isEmpty(errors)
    }
}