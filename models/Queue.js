const mongoose = require('mongoose')
const Schema = mongoose.Schema

//Create Queue
const QueueSchema = new Schema(
    {
    queueList: [
        {
            userId:{
                type: String
            },
            date:{
                type: Date,
                default: Date.now
            }
        }
    ]
}
)

module.exports = UserQueue = mongoose.model("userQueue",QueueSchema);