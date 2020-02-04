const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Create Queue
const QueueSchema = new Schema(
    {
        userId:{
            type: String
        },
        stage:{
            type: Number
        },
        level:{
            type: String
        },
        date:{
            type: Date,
            default: Date.now
        }
}
)

module.exports = UserQueue = mongoose.model("userQueue",QueueSchema);