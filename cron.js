const express = require('express')
const app = express()
var cron = require('node-cron');
var request=require('request');
const mongoose = require('mongoose')

//DB config
const db = require('./config/keys').mongoUri;

//Connect Db
mongoose.connect(db,{ 
    useNewUrlParser: true,
    useUnifiedTopology: true
 }).
 then(() => console.log("Database Connected Successfully")).
 catch(err => console.log(err))

//Load user model
const User = require('./models/User')
 
// 0 10 * * *

cron.schedule('0 10 * * *', () => {
    User.find({},(err,res) => {
        res.map(user => {
            if(!user.action){
                var currDate = new Date();
                var getTimeDiff = (user.date - currDate)/(1000 * 3600 * 24);
                if(getTimeDiff<=3){
                var message = "Hello, your wallet balance is empty. Login and add funds here https://www.fortunevision.in";
                request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+user.number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
                }
            }
        })
    })
    .catch(err => {
        console.log(err)
    })
});

app.listen(3000,console.log('Running'))