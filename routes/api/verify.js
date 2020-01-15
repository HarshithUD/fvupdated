const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
var request=require('request');

//Load input values
const validateRegister = require('../../validation/register')
const validateLogin = require('../../validation/login')
const validateLogin1 = require('../../validation/alogin')
const validateOtp = require('../../validation/otp')

//Load user model
const Otp = require('../../models/OtpData')
//Load user model
const User = require('../../models/User')

// @route POST api/verify/mobile
// @desc Verify user mobile
// @access Public
router.post('/mobile', (req,res) => {

    var otpInput = req.body.otp;
    var number = req.body.number;
    number = number.toString();
    type = req.body.type;
    Otp.find({number,type}).then(dataOtp=>{
        const updatedTime = dataOtp[0].updatedAt;
        const currentTime = new Date();
        const timeDiff = currentTime - updatedTime;
        if((timeDiff/60000)>30){
            res.json({
                error: true,
                message:"Otp Have Expired!!"
            });
        }
        else{
            if(otpInput === dataOtp[0].otp){
                User.findOneAndUpdate({number:number},{verified:true},{useFindAndModify:false}).then( updatedDoc => {

                    res.json({
                        error: false,
                        message:"Otp Verified!"
                    });
                })
                .catch(
                    err => {console.log(err)}
                );
            }
            else{

                res.json({
                    error: true,
                    message:"Otp Incorrect!"
                });
            }
        }
    })
})

// @route POST api/verify/mobile2
// @desc Verify user mobile
// @access Public
router.post('/mobilex', (req,res) => {

    var otpInput = req.body.otp;
    var email = req.body.email;
    type = req.body.type;
    User.findOne({email:email},(err,resultDet) => {
        if(!resultDet){
            User.findOne({number:email},(err,resultDet2) => {
                if(!resultDet2){
                    return res.status(404).json({email: "Account Not Found"});
                }
                else{
                    var number = email.toString();
                    Otp.find({number,type}).then(dataOtp=>{
                        const updatedTime = dataOtp[0].updatedAt;
                        const currentTime = new Date();
                        const timeDiff = currentTime - updatedTime;
                        if((timeDiff/60000)>30){
                            res.json({
                                error: true,
                                message:"Otp Have Expired!!"
                            });
                        }
                        else{
                            if(otpInput === dataOtp[0].otp){
                                User.findOneAndUpdate({number:number},{verified:true},{useFindAndModify:false}).then( updatedDoc => {
                
                                    res.json({
                                        error: false,
                                        message:"Otp Verified!"
                                    });
                                })
                                .catch(
                                    err => {console.log(err)}
                                );
                            }
                            else{
                
                                res.json({
                                    error: true,
                                    message:"Otp Incorrect!"
                                });
                            }
                        }
                    })
                }
            })
        }
        else{
            var number = resultDet.number;
            Otp.find({number,type}).then(dataOtp=>{
                const updatedTime = dataOtp[0].updatedAt;
                const currentTime = new Date();
                const timeDiff = currentTime - updatedTime;
                if((timeDiff/60000)>30){
                    res.json({
                        error: true,
                        message:"Otp Have Expired!!"
                    });
                }
                else{
                    if(otpInput === dataOtp[0].otp){
                        User.findOneAndUpdate({number:number},{verified:true},{useFindAndModify:false}).then( updatedDoc => {
        
                            res.json({
                                error: false,
                                message:"Otp Verified!"
                            });
                        })
                        .catch(
                            err => {console.log(err)}
                        );
                    }
                    else{
        
                        res.json({
                            error: true,
                            message:"Otp Incorrect!"
                        });
                    }
                }
            })
        }
    })
})

// @route POST api/verify/checkOtp
// @desc Verify user mobile
// @access Public
router.post('/checkOtp', (req,res) => {

    var otpInput = req.body.otp;
    var number = req.body.number;
    number = number.toString();
    type = req.body.type;
    Otp.find({number,type}).then(dataOtp=>{
        const updatedTime = dataOtp[0].updatedAt;
        const currentTime = new Date();
        const timeDiff = currentTime - updatedTime;
        if((timeDiff/60000)>30){
            res.json({
                error: true,
                message:"Otp Have Expired!!"
            });
        }
        else{
            if(otpInput === dataOtp[0].otp){
                require('crypto').randomBytes(15, function(err, buffer) {
                    var token = buffer.toString('hex');
                    User.findOneAndUpdate({number:number},{token:token},{useFindAndModify:false}).then( updatedDoc => {
                        res.json({
                            error: false,
                            message:"Otp Verified!",
                            token:token,
                            id:updatedDoc._id
                        });
                    }).catch(err => {
                        console.log(err)
                    })
                  });
            }
            else{

                res.json({
                    error: true,
                    message:"Otp Incorrect!"
                });
            }
        }
    })
})

// @route POST api/verify/profile
// @desc Verify user mobile
// @access Public
router.post('/profile', (req,res) => {

    var otpInput = req.body.otp;
    var number = req.body.number;
    number = number.toString();
    type = req.body.type;
    Otp.find({number,type}).then(dataOtp=>{
        const updatedTime = dataOtp[0].updatedAt;
        const currentTime = new Date();
        const timeDiff = currentTime - updatedTime;
        if((timeDiff/60000)>30){
            res.json({
                error: true,
                message:"Otp Have Expired!!"
            });
        }
        else{
            if(otpInput === dataOtp[0].otp){
                User.findOne({number:number},(err,result) => {
                    var message = "Congrats, "+result.name+" you are successfully registered in Fortune Vision with your Email/Mobile-Number and your Chosen Password , Visit us at https://fortunevision.in";
                    request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
                    res.json({
                        error: false,
                        message:"Otp Verified!"
                    });
                })
            }
            else{
                res.json({
                    error: true,
                    message:"Otp Incorrect!"
                });
            }
        }
    })
})

// @route post api/verify/mobile
// @desc Update user profile
// @access Public
router.post('/genOtp', (req,res) => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    currentDateTime = new Date();
    console.log(req.body)
    var otpType = req.body.type;
    var number = req.body.number;
    message = "Greetings from Fortune Vision! Your OTP for Updating profile is "+otp;
    request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json',options = {method:'GET'},function(err,ress,body){
        if(err) throw err;
        if(ress.statusCode === 200){
            Otp.find({number: number,type:otpType},(err,docs)=>{
                if(docs.length<1){
                    const otpData = new Otp({
                        number: number,
                        otp: otp,
                        type:otpType
                    })
                    otpData.save()
                    .then(
                        res.json({
                            error:false,
                            message:""
                        })
                    )
                    .catch(err => console.log(err))
                }
                else{
                    Otp.findOneAndUpdate({number: number,type:otpType}, {$set:{otp:otp,updatedAt:currentDateTime}},{useFindAndModify:false},(err, updatedDoc) => {
                        if(err) console.log(err);
                        if(updatedDoc){
                            res.json({
                                error:false,
                                message:""
                            })
                        }
                        else{
                            res.json({
                                error:true,
                                message:"Error"
                            })
                        }
                    })
                }
            })
        }
    }).on('error', errr => {
        console.log('Error: '+errr)
    })
})

// @route post api/verify/mobile
// @desc Update user profile
// @access Public
router.post('/updateOtp', (req,res) => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    currentDateTime = new Date();
    var email = req.body.email;
    var otpType = req.body.type;
    User.findOne({email:email},(err,resultDet) => {
        if(!resultDet){
            User.findOne({number:email},(err,resultDet2) => {
                if(!resultDet2){
                    return res.status(404).json({email: "Account Not Found"});
                }
                else{
                    var number = resultDet2.number;
                    message = "Your OTP is "+otp+'. Please use this to register in Fortune Vision.';
                    request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json',options = {method:'GET'},function(err,ress,body){
                        if(err) throw err;
                        if(ress.statusCode === 200){
                            Otp.find({number: number,type:otpType},(err,docs)=>{
                                if(docs.length<1){
                                    const otpData = new Otp({
                                        number: number,
                                        otp: otp,
                                        type:otpType
                                    })
                                    otpData.save()
                                    .then(
                                        res.json({
                                            error:false,
                                            message:""
                                        })
                                    )
                                    .catch(err => console.log(err))
                                }
                                else{
                                    Otp.findOneAndUpdate({number: number,type:otpType}, {$set:{otp:otp,updatedAt:currentDateTime}},{useFindAndModify:false},(err, updatedDoc) => {
                                        if(err) console.log(err);
                                        if(updatedDoc){
                                            res.json({
                                                error:false,
                                                message:""
                                            })
                                        }
                                        else{
                                            res.json({
                                                error:true,
                                                message:"Error"
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }).on('error', errr => {
                        console.log('Error: '+errr)
                    })
                }
            })
        }
        else{
            var number = resultDet.number;
            message = "Your OTP is "+otp+'. Please use this to register in Fortune Vision.';
            request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json',options = {method:'GET'},function(err,ress,body){
                if(err) throw err;
                if(ress.statusCode === 200){
                    Otp.find({number: number,type:otpType},(err,docs)=>{
                        if(docs.length<1){
                            const otpData = new Otp({
                                number: number,
                                otp: otp,
                                type:otpType
                            })
                            otpData.save()
                            .then(
                                res.json({
                                    error:false,
                                    message:""
                                })
                            )
                            .catch(err => console.log(err))
                        }
                        else{
                            Otp.findOneAndUpdate({number: number,type:otpType}, {$set:{otp:otp,updatedAt:currentDateTime}},{useFindAndModify:false},(err, updatedDoc) => {
                                if(err) console.log(err);
                                if(updatedDoc){
                                    res.json({
                                        error:false,
                                        message:""
                                    })
                                }
                                else{
                                    res.json({
                                        error:true,
                                        message:"Error"
                                    })
                                }
                            })
                        }
                    })
                }
            }).on('error', errr => {
                console.log('Error: '+errr)
            })
        }
    })
    var number = req.body.number;
   
})

module.exports = router;