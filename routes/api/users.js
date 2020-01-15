require('dotenv').config()
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const path = require('path')
const multer = require("multer");
const fs = require("fs");
var request=require('request');
var mime = require('mime');
var nodemailer = require('nodemailer');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

//Image upload
const storage = multer.diskStorage({
    destination: "./build/uploads/",
    filename: function(req, file, cb){
       cb(null, "I-" + Date.now() + path.extname(file.originalname));
    }
 });
 
 const upload = multer({
    storage: storage,
    limits:{fileSize: 1000000},
 }).single('selfie');

 //Set up Mail SERVER
 
 var transport = {
    service: 'gmail',
    auth: {
      user: 'harshith@undigit.com',
      pass: 'h@skipalong12'
    }
  }
  
var transporter = nodemailer.createTransport(transport);

transporter.verify((error, success) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take messages');
    }
});

//Load input values
const validateRegister = require('../../validation/register')
const validateLogin = require('../../validation/login')
const validateLogin1 = require('../../validation/alogin')

//Load user model
const User = require('../../models/User')

//Load admin model
const Admin = require('../../models/Admin')

//Contact Data Model
const Contact = require('../../models/Contact')

//Load user model
const Otp = require('../../models/OtpData')

// Get Admin details
getAdminResult = () =>{
    return new Promise(function(resolve,reject){
        Admin.find({},(err,res) => {
            const getAdminSpecs = {
                adminId:res[0]._id,
                lvl1dep:res[0].lvl1dep,
                lvl1ser:res[0].lvl1ser,
                lvl1depfin:(res[0].lvl1dep - res[0].lvl1ser),
                lvl2dep:res[0].lvl2dep,
                lvl2ser:res[0].lvl2ser,
                lvl2depfin:(res[0].lvl2dep - res[0].lvl2ser),
                lvl3dep:res[0].lvl3dep,
                lvl3ser:res[0].lvl3ser,
                lvl3depfin:(res[0].lvl3dep - res[0].lvl3ser),
            }
            resolve(getAdminSpecs);
        })
    }
    )
}

// @route POST api/users/register
// @desc Register user
// @access Public
router.post('/register',async (req,res) => {
    //Form Validation
    const {errors,isValid } = validateRegister(req.body);
    const uName = req.body.name;
    const referralName = uName.substring(0, 2);
    var randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    randomStr = randomStr.substr(0,4);
    const referralId = (referralName+randomStr).toUpperCase();

    //check validation
    if(!isValid) {
        return res.status(400).json(errors);
    }

    var count = await User.find({});
    if(((count.length)===0) && ((req.body.referrer)!=='')){
        var getReferrals = await User.find({referrer:req.body.referrer});
        if(!getReferrals){
            return res.status(400).json({referrer: "Referrer doesn't exist"});
        }
        else if(getReferrals.length>=2){
            return res.status(400).json({referrer: "Referrals Already Full"});
        }
    }
    
    User.findOne(
        {$or: [
            {email: req.body.remail},
            {number: req.body.mobile}
        ]}
    ).then(user => {
        if(user) {
            return res.status(400).json({remail: "Account already Exists! Please Login to Continue"});
        }
        else{
            const NewUser = new User({
            name : req.body.name,
            email : req.body.remail,
            password : req.body.rpassword,
            number : req.body.mobile,
            referralId:referralId,
            referrer:req.body.referrer
            })

        //Hash Password Before saving
        bcrypt.genSalt(10, (err,salt) => {
            bcrypt.hash(NewUser.password,salt,(err,hash) => {
                if(err) console.log(err);
                NewUser.password = hash;
                //Generate OTP 
                // const otp = Math.floor(1000 + Math.random() * 9000);
                // var otpType = 'register';
                // var message = "Your OTP is "+otp+'. Please use this to register in Fortune Vision.';
                // request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+NewUser.number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json',options = {method:'GET'},function(err,ress,body){
                //     if(err) console.log(err);
                //     if(ress.statusCode === 200){
                //         Otp.find({number: NewUser.number},(err,docs)=>{
                //             if(docs.length<1){
                //                 const otpData = new Otp({
                //                     number: NewUser.number,
                //                     otp: otp,
                //                     type:otpType
                //                 })
                //                 otpData.save()
                //                 .then(
                //                     NewUser
                //                     .save()
                //                     .then(user => {res.json(user)})
                //                     .catch(err => console.log(err))
                //                 )
                //                 .catch(err => console.log(err))
                //             }
                //             else{
                //                 var currDate = Date.now();
                //                 Otp.findOneAndUpdate({number:NewUser.number},{
                //                     $set:{
                //                         otp:otp,
                //                         updatedAt:currDate
                //                     }
                //                 },{useFindAndModify:false}).then(
                //                     NewUser
                //                     .save()
                //                     .then(user => {res.json(user)})
                //                     .catch(err => console.log(err))
                //                 )
                //             }
                //         })
                //     }
                // }).on('error', errr => {
                //     console.log('Error: '+errr)
                // }) ** OTP DISABLED
                NewUser
                .save()
                .then(user => res.json(user))
                .catch(err => console.log(err))
                
                
            })
        })
        }
    })
} )

// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post('/login',(req,res) => {
    //Form Validation
    const {errors,isValid} = validateLogin(req.body);

    //Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const emailnum = (req.body.email).toLowerCase();
    const password = req.body.password;

    //Find User by Account
	
    User.findOne({email:emailnum}).then(user => {
        if(!user){
            User.findOne({number:emailnum}).then(user => {
                if(!user){
                    return res.status(404).json({emailNotFound: "Account not found!"});
                }
                // else if(!user.verified){
                //     return res.status(404).json({otpNotVerified: "OTP not verified. <a id='verifyOtp'> Click Here to verify OTP</a>"});
                // } ** OTP Disabled

        //Check password
        bcrypt.compare(password,user.password).then(isMatch => {
            if(isMatch){
                //user Matched
                //Create jwt payload
                const payload = {
                    id: user.id,
                    name: user.name,
                    type:'user',
                    active:user.active,
                    declined:user.declined
                };

                //Sign Token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {
                        expiresIn: 31556926 //1 year
                    },
                    (err,token) => {
                        res.json({
                            success:true,
                            token: "Bearer "+token
                        });
                    }
                );
            } else {
                return res
                .status(400)
                .json({passwordIncorrect: "Please Check Email or Password and try again!"});
            }
        })
        })
    }
	else{
        // if(!user.verified){
        //     return res.status(404).json({otpNotVerified: "OTP not verified. <a id='verifyOtp'> Click Here to verify OTP</a>"});
        // } ** DISABLED OTP
		//Check password
        bcrypt.compare(password,user.password).then(isMatch => {
            if(isMatch){
                //user Matched
                //Create jwt payload
                const payload = {
                    id: user.id,
                    name: user.name,
                    type:'user',
                    active:user.active,
                    declined:user.declined
                };

                //Sign Token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {
                        expiresIn: 31556926 //1 year
                    },
                    (err,token) => {
                        res.json({
                            success:true,
                            token: "Bearer "+token
                        });
                    }
                );
            } else {
                return res
                .status(400)
                .json({passwordIncorrect: "Please Check Email or Password and try again!"});
            }
        })
	}
    })
})

// @route POST api/users/updatePass
// @desc Change Pass
// @access Public
router.post('/updatePass',(req,res)=>{
    const mobile = req.body.mobile;

    User.findOne({number:mobile}).then(
        user => {
            if(!user){
                return res.status(404).json({emailNotFound: "Account not found!"});
            }
            else{
                //Generate OTP 
                const otp = Math.floor(1000 + Math.random() * 9000);
                var otpType = req.body.type;
                var currDate = Date.now();
                var message = "Your OTP is "+otp+'. Please use this to Change Password in Fortune Vision.';
                request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+mobile+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json',options = {method:'GET'},function(err,ress,body){
                    if(err) console.log(err);
                    if(ress.statusCode === 200){
                        Otp.find({number: mobile,type:otpType},(err,docs)=>{
                            if(docs.length<1){
                                const otpData = new Otp({
                                    number: mobile,
                                    otp: otp,
                                    type:otpType
                                })
                                otpData.save()
                                .then(
                                    res.json(user)
                                )
                                .catch(err => console.log(err))
                            }
                            else{
                                Otp.findOneAndUpdate({number:mobile,type:otpType},{
                                    $set:{otp:otp,updatedAt:currDate}
                                },{useFindAndModify:false}).then(
                                    res.json(user)
                                )
                            }
                        })
                    }
                }).on('error', errr => {
                    console.log('Error: '+errr)
                })
            }
        }
    )
})

// @route POST api/users/putPass
// @desc update pass
// @access Public
router.post('/putPass',(req,res)=>{
    const pass1 = req.body.password;
    const pass2 = req.body.password2;
    const token = req.body.token;
    const id = req.body.id;
    if(pass1===''){
        return res.status(404).json({password: "Password cannot be blank"});
    }
    if(pass2===''){
        return res.status(404).json({password2: "Password cannot be blank"});
    }
    if(pass1!==pass2){
        return res.status(404).json({password2: "Passwords donot Match!"});
    }
    if(((pass1.length)>30) || ((pass1.length)<6)){
        return res.status(404).json({password2: "Passwords must be greater than 6 Characters and less than 30 Characters"});
    }
    else {
        //Hash Password Before saving
        bcrypt.genSalt(10, (err,salt) => {
            bcrypt.hash(pass1,salt,(err,hash) => {
                if(err) console.log(err);
                newPassword = hash;
        User.findOne({_id:id,token:token}).then(user => {
            if(!user){
                return res.status(404).json({password2: "Invalid request"});
            }else{
                User.findByIdAndUpdate({_id:id},{
                    $set:{token:'',password:newPassword}
                },{useFindAndModify:false}).then(user => {
                    res.json({
                        error:false,
                        message:"Password Updated Successfully!!"
                    })
                })
            }
        })
    })
})
    }
})


// @route POST api/users/admin2019
// @desc Login Admin and return JWT token
// @access Admin
router.post('/admin2019',(req,res) => {
    //Form Validation
    const {errors,isValid} = validateLogin1(req.body);

    //Check Validation
    if(!isValid){
        return res.status(400).json(errors);
    }

    const name = req.body.name;
    const password = req.body.password;

    //Find User by Email
    Admin.findOne({name}).then(user => {
        if(!user){
            return res.status(404).json({userNotFound: "User not found"});
        }

        //Check password
        bcrypt.compare(password,user.password).then(isMatch => {
            if(isMatch){
                //user Matched
                //Create jwt payload
                const payload = {
                    id: user.id,
                    name: user.name,
                    type:'admin'
                };

                //Sign Token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    {
                        expiresIn: 31556926 //1 year
                    },
                    (err,token) => {
                        res.json({
                            success:true,
                            token: "Bearer "+token
                        });
                    }
                );
            } else {
                return res
                .status(400)
                .json({passwordIncorrect: "Please Check Email or Password and try again!"});
            }
        })
    })
})

//@route get api/users/admin/getUsers
//@desc Get Users
//@access Admin
router.get('/admin/getUsers', (req,res) => {
    //Get all the users
    let count = 0;
    let UserInfo = [];
    User.find({}).then(result => {
        result.forEach(function(val,index,arr){
            UserInfo[index] = {
                slno:++count,
                name:val.name,
                email:val.email,
                date:val.date,
                action:val.action,
                active:val.active,
                all:val
            }
        })
        res.setHeader('content-type', 'text/html');
        res.send(UserInfo)
    })
    .catch(error => {
        console.log(error);
    })
})

//@route get api/users/delete/userid
//@desc Get Users
//@access Admin
// router.get('/delete/:userid', (req,res) => {
//     //Get all the users
//     const userid = req.params.userid;
//     User.findOneAndDelete({_id:userid},(err,doc) => {
//         res.send(doc)
//     })
//     .catch(error => {
//         console.log(error);
//     })
// })

// @route POST api/users/getDetails/userid
// @desc Get user
// @access Public
router.get('/getDetails/:userid', (req,res) => {
    //Get the user details
    const userid = req.params.userid;
    User.findOne({_id:userid},(err,resp) => {
        if(err) console.log(err);
        res.json(resp);
    })
})

// @route POST api/users/activate/userid
// @desc Get user
// @access Public
router.get('/activate/:userid',async (req,res) => {
    //Get the user details
    const userid = req.params.userid;
            User.findOneAndUpdate({_id:userid},{$set:{active:true,declined:false}},{useFindAndModify:false},(err,resp) => {
                if(err) console.log(err);
                const number = parseInt(resp.number);
                const message = "Congrats! Your profile is now activated. Add balance to your wallet to start.";
                request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
                res.send(true);
            })
})

// @route DELETE api/users/decline/userid
// @desc Get user
// @access Public
router.delete('/decline/:userid',async (req,res) => {
    //Get the user details
    const userid = req.params.userid;
    await getAdminResult().then(
        resultVal => {
            User.findOneAndUpdate({_id:userid},{$set:{declined:true}},{useFindAndModify:false}).then(res => {
                const number = parseInt(res.number);
                const message = "Your account has been declined";
                request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
                res.send(true)
            }
            )
        }
    )
})

// @route POST api/users/getAdminDetails/userid
// @desc Get user
// @access Public
router.get('/getAdminDetails/:userid', (req,res) => {
    //Get the user details
    const userid = req.params.userid;
    Admin.findOne({_id:userid},(err,resp) => {
        if(err) console.log(err);
        res.json(resp);
    })
})

// @route POST api/users/getTree/userid
// @desc Get user
// @access Public
router.get('/getTree/:userid', (req,res) => {
    //Get the user details
    const userid = req.params.userid;
    getUserData(userid).then(result => {
        res.send(result)
    });
})

function getUserData(userid){
    let child1 = [];
    return new Promise((resolve,reject) => {
        User.find({_id:userid},async (err,response) => {
            userdata = {
                name:response[0].name,
                id:response[0]._id,
                child1: (response[0].childIds[0] && await getData(response[0].childIds[0])),
                child2: (response[0].childIds[1] && await getData(response[0].childIds[1]))
            }
            resolve(userdata)
        })
    })
}

function getData(data1){
    if(typeof data1!=undefined){
    return new Promise(async (res,rej) => {
        await User.find({_id:data1.userId},async (err,docc) => {
            childData = {
                name: docc[0].name.substring(0,3)+'*******',
                child1: await getchildInfo(docc[0].childIds[0]),
                child2: await getchildInfo(docc[0].childIds[1])
            }
            res(childData)
        })
    })
    }
}

function getchildInfo(data2){
    if(data2!=undefined){
        return new Promise(async (res,rej) => {
            await User.find({_id:data2.userId},(err,docc1) => {
                var childData = {
                    name: docc1[0].name.substring(0,3)+'*******'
                }
                res(childData)
            })
        })
    }
    }

// @route POST api/users/getTransaction/userid
// @desc Get user
// @access Public
router.get('/getTransaction/:userid', (req,res) => {
    var userid = req.params.userid;
    User.findOne({_id:userid},(err,resp) => {
        if(err) console.log(err);
        let allData = resp;
        res.send(allData)
    })
})

// @route POST api/users/reqPayout/userid
// @desc Get user
// @access Public
router.get('/reqPayout/:userid', (req,res) => {
    var userid = req.params.userid;
    User.findOneAndUpdate({_id:userid},{
        $set:{'payout.requested':true}
    },{useFindAndModify:false},(err,resp) => {
        if(err) console.log(err);
        let allData = resp;//Yes
        res.send(true)
    })
    // .then(
    //     User.find({},(err,resp) => {
    //         resp.payout.transactions.push({

    //         })
    //     })
    // )
})

// @route POST api/users/deposit/userid
// @desc Get user
// @access Public
router.get('/deposit/:user', (req,res) => {
    var user = req.params.user;
    var userid = user.split('@')[0];
    var depAmt = user.split('@')[1];
    User.find({_id:userid},(err,resp) => {
        if(err) console.log(err);
        resp[0].transactions.push({
            name:"Funds Added",
            type:"Deposit",
            amount:'+'+depAmt
        })
        resp[0].save();
        var wall = parseFloat(resp[0].wallet)+parseFloat(depAmt)
        User.findOneAndUpdate({_id:userid},{$set:{'wallet':wall}},{useFindAndModify:false},(err,resp) => {
            if(err) console.log(err);
        }).then(
            res.send(true)
        )
    })
})

// @route POST api/users/contactData
// Add Contact Data
// @access Public
router.post('/contactData', (req,res) => {
    const ContactData = new Contact({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        msg: req.body.msg
    })
    var content = `name: ${ContactData.name} \n email: ${ContactData.email} \n subject: ${ContactData.subject} \n message: ${ContactData.msg} `
    var mail = {
        from: ContactData.name,
        to: 'hr121995@gmail.com',  //Change to email address that you want to receive messages on
        subject: 'New Query from Contact Form',
        text: content
    }

    transporter.sendMail(mail, (err, data) => {
        if (err) {
          res.json({
              error:true,
            msg: 'fail'
          })
        }
      })


    ContactData.save()
    .then(result => {
        res.send(true)
    }).catch(err => 
    {
    console.log(err);
    res.send(false);
    }
    )
})

// @route POST api/users/deposit/userid
// @desc Get user
// @access Public
router.get('/acceptPay/:user', (req,res) => {
    var user = req.params.user;
    var userid = user.split('@!')[0];
    var depAmt = user.split('@!')[1];
	var mot = user.split('@!')[2];
	var motid = user.split('@!')[3].replace(/[^a-zA-Z0-9]/g, "");
    User.findOneAndUpdate({_id:userid},{$push:{
        transactions:{
            name:"Payout",
            type:"Withdrawal",
			mot:mot,
			mottid:motid,
            amount:'-'+depAmt
        },'payout.transactions':{
            status:"Approved",
            amount:'-'+depAmt
        }
    },
    $set:{'payout.requested':false},
    $inc:{wallet:-depAmt,'payout.eligible':-depAmt}
    },{useFindAndModify:false}).then( resval => {
        const number = parseInt(resval.number);
        const message = "Congrats! We have credited your account with fresh funds.";
        request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
        res.send(true)
    }) 
})

// @route POST api/users/updateDetails
// @desc Get user
// @access Public
router.post('/updateSelfie', (req,res) => {
    // Upload image first
    upload(req, res, (err) => {
        if(err){
            res.json({
                message: err,
                status:false
            })
        }
    else{
        var file = req.file;
        if(typeof file === 'undefined' || file===null){
            res.json({
                status:true
            })
        }
        else{
        var nametoreplace = req.body.filename;
        var filepath = file.destination;
        var ext = path.extname(file.filename)
        fs.renameSync(filepath+file.filename, filepath+'selfie_'+nametoreplace+ext);
        User.findOneAndUpdate({_id:nametoreplace},{
            imagePath:'./uploads/'+'selfie_'+nametoreplace+ext
        },{useFindAndModify:false}, (err,response) => {
            if(err) console.log(err);
            res.json({
                status:true
            })
        })
    }
    }
     })
    }
)

// @route POST api/users/updateDetails
// @desc Get user
// @access Public
router.put('/updateDetails', (req,res) => {
    // Update user Details
    User.findOneAndUpdate({_id:req.body.id},{
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        email:req.body.email,
        mobile:req.body.mobile,
        address:req.body.address,
        pan:req.body.pan,
        bankuser:req.body.bankuser,
        bankname:req.body.bankname,
        accnumber:req.body.accnumber,
        ifsc:req.body.ifsc,
    },{useFindAndModify:false}, (err,response) => {
        if(err) console.log(err);
        var message = "Your profile details have been updated sucessfully.";
        request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+response.number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
    }).then(result => {
        res.json(result);
    })
})

// @route POST api/users/updateDetails
// @desc Get user
// @access Public
router.put('/updateAdminDetails', (req,res) => {
    //Update user Details
    Admin.findOneAndUpdate({_id:req.body.id},{
        name:req.body.name,
        email:req.body.email,
        lvl1dep:req.body.lvl1dep,
        lvl1ser:req.body.lvl1ser,
        lvl2dep:req.body.lvl2dep,
        lvl2ser:req.body.lvl2ser,
        lvl3dep:req.body.lvl3dep,
        lvl3ser:req.body.lvl3ser,
    },{useFindAndModify:false}, (err,response) => {
        if(err) console.log(err);
    }).then(result => {
        res.json(result);
    })
})

router.get('/download', function(req, res){

    var file = './build/fortuneVisionAndroid.apk';
    // res.download('./build/11.apk')
  
    var filename = path.basename(file);
    var mimetype = mime.lookup(file);
  
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
  
    var filestream = fs.createReadStream(file);
    filestream.pipe(res);
});

module.exports = router;