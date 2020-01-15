const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ContactSchema = new Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    subject: {
        type: String
    },
    msg: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = ContactData = mongoose.model("ContactData",ContactSchema);