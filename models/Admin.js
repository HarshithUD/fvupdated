const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Create Schema
const adminSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    date:{
        type:Date,
        default:Date.now
    },
    lvl1dep:{
        type:Number,
        default:0
    },
    lvl2dep:{
        type:Number,
        default:0
    },
    lvl3dep:{
        type:Number,
        default:0
    },
    lvl1ser:{
        type:Number,
        default:0
    },
    lvl2ser:{
        type:Number,
        default:0
    },
    lvl3ser:{
        type:Number,
        default:0
    },
    
});

module.exports = Admin = mongoose.model("admin",adminSchema);