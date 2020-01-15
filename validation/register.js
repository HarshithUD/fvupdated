const Validator = require('validator')
const isEmpty = require('is-empty')

module.exports = function validateRegisterInput(data){
    let errors = {};

    //Convert Empty fields to an empty String to use validator functions
    data.name = !isEmpty(data.name)?data.name: "";
    data.remail = !isEmpty(data.remail)?data.remail: "";
    data.mobile = !isEmpty(data.mobile)?data.mobile: "";
    data.rpassword = !isEmpty(data.rpassword)?data.rpassword: "";
    data.password2 = !isEmpty(data.password2)?data.password2: "";

    //Name Check
    if(Validator.isEmpty(data.name)){
        errors.name = "Name field is required";
    }

    //Mobile Check
    if(Validator.isEmpty(data.mobile)){
        errors.mobile = "Mobile field is required";
    }

    //Email Check
    if(Validator.isEmpty(data.remail)){
        errors.remail = "Email field is required";
    }else if(!Validator.isEmail(data.remail)){
        errors.remail = "Please Enter Valid Email";
    }

    //Password check
    if(Validator.isEmpty(data.rpassword)){
        errors.rpassword = "Password field is required";
    }

    if(Validator.isEmpty(data.password2)){
        errors.password2 = "Confirm Password is required";
    }

    if(!Validator.isLength(data.rpassword,{min: 6,max: 30})){
        errors.rpassword = "Password must be minimum 6 Characters and Maximum 30 Characters";
    }

    if(!Validator.equals(data.rpassword,data.password2)){
        errors.password2 = "Passwords donot match";
    }

    // if(!Validator.equals(data.otp,data.otp)){
    //     errors.password2 = "Incorrect OTP";
    // }

    return {
        errors,
        isValid:isEmpty(errors)
    }
}