const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Create Schema
const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    token:{
        type: String
    },
    lastname:{
        type: String,
    },
    email:{
        type: String,
        required: true
    },
    number:{
        type: String,
        required: true
    },
    verified:{
        type: Boolean,
        default: false
    },
    address:{
        streetaddress:{
            type: String,
        },
        city:{
            type: String,
        },
        state:{
            type: String,
        },
        pincode:{
            type: String,
        },
    },
    pan:{
        type: String,
        
    },
    bankuser:{
        type: String,
        
    },
    bankname:{
        type: String,
        
    },
    ifsc:{
        type: String,
        
    },
    accnumber:{
        type: String,
        
    },
    active: {
        type: Boolean,
        default: false
    },
    parentId: {
        type: String,
        default:null
    },
    childIds: [
        {
            userId:{
                type: String
            },
            date:{
                type: Date,
                default: Date.now
            }
        }
    ],
    stage: {
        type: Number,
        default: 1
    },
    class: {
        type: String,
        default: 1
    },
    level: {
        type: String,
        default:0
    },
    weight: {
        type: Number,
        default:0
    },
    date:{
        type:Date,
        default:Date.now
    },
    password:{
        type: String,
        required: true
    },
    transactions:[
        {
            name:{
                type: String
            },
            type:{
                type: String
            },
            amount:{
                type: String
            },
            date:{
                type: Date,
                default: Date.now
            },
			mot:{
				type: String
			},
			mottid:{
				type: String
			}
        }
    ],
    payout:
        {
            requested:{
                type: Boolean,
                default: false
            },
            eligible:{
                type: Number,
                default: 0
            },
            date:{
                type:Date,
                default:Date.now
            },
            transactions:[
                {
                    status:{
                        type:String
                    },
                    amount:{
                        type:String
                    },
                    date:{
                        type:Date,
                        default:Date.now
                    }
                }
            ]
        },
    wallet:{
        type: Number,
        default: 0
    },
    action:{
        type:Boolean,
        default:false
    },
    declined:{
        type:Boolean,
        default:false
    },
    imagePath:{
        type:String
    },
    referralId:{
        type: String
    },
    referrer:{
        type: String
    },
    childUpgraded: [
        {
            userId:{
                type: String
            },
            date:{
                type: Date,
                default: Date.now
            }
        }
    ],
})

module.exports = User = mongoose.model("users",userSchema);