const Validator = require('validator')
const isEmpty = require('is-empty')

module.exports = function validateLoginInput(data){
    let errors = {};
    //convert empty fields into string
    data.name = !isEmpty(data.name) ? data.name : "";
    data.password = !isEmpty(data.password) ? data.password : "";

    // Email checks
    if (Validator.isEmpty(data.name)) {
        errors.email = "Email field is required";
    }
        
    // Password checks
    if (Validator.isEmpty(data.password)) {
        errors.password = "Password field is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}