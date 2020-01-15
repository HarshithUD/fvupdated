const express = require('express');
const router = express.Router()
const User = require('../../models/User')
const Queue = require('../../models/Queue')
const Admin = require('../../models/Admin')
var request=require('request');
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug2.log', {flags : 'w'});
var log_stdout = process.stdout;

// console.log = function(d) { //
//     log_file.write(util.format(d) + '\n');
//     log_stdout.write(util.format(d) + '\n');
// };

router.get('/queue', (req,res) => {
    Queue.find({}, (err,ele) => {
        ele[1].queueList.push({userId:'ddfdfdfd'});
        ele[1].save()
    })
})

//Admin Approval
// @route GET api/queue/approve
// @desc Register user
// @access Public
router.get('/approve/:userId',async (req,res) => {
    let userId = req.params.userId;
    await QueueOperations(userId).then(
        result => {
            if(result){
                res.send(true);
            }
            else{
                res.send(false);
            }
        }
    ).catch(rej => {
        res.json(rej)
    })
})

// Get Admin details
getAdminResult = () =>{
    return new Promise(function(resolve,reject){
        Admin.find({name:'admin1'},(err,res) => {
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

//Function for Queue Operations
function QueueOperations(userId){
    return new Promise(function(res,rej){
        let doneOps = false;
        Queue.findOneAndUpdate({},{},{upsert:true,new:true,setDefaultsOnInsert: true,useFindAndModify: false}, (err,resElem) => {
            if(err) console.log(err);
            if(!resElem){
                newQueue = new Queue({
                    userId: userId
                });
                newQueue.save();
                res(true);
            }
            else {
            Queue.find({},async (err,resElems) => {
            let queueLength = resElems[0].queueList.length;
            if(queueLength == 0){
                resElems[0].queueList.push({userId:userId})
                resElems[0].save();
                await getAdminResult().then(
                    resultVal => {
                User.findByIdAndUpdate(
                    {_id:userId},
                    {$set: {
                        action:true,
                        wallet:resultVal.lvl1depfin
                    }},{useFindAndModify:false},(err,res2) => {
                        if(err){console.log(err);}
                        res2.transactions = {
                            name:"Initial Deposit",
                            type:"Deposit",
                            amount:'+'+resultVal.lvl1depfin
                        }
                        res2.save();
                        const number = parseInt(res2.number);
                        const message = "Congrats! Your wallet balance is updated with the deposit amount.";
                        request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
                    }
                )
                    }
                )
                res(true);
            }
            else{
            for(i=0;i<queueLength;i++){
                if(!doneOps){
                await User.find({_id:resElems[0].queueList[i].userId},async (err,loopResult) => {
                    if(err) console.log(err);
                    User.find({_id:loopResult[0]._id},async (err,result) => {
                        if(err)console.log(err);
                        var childIds = result[0].childIds;
                        var childWeight = result[0].childIds.length;
                        if(childWeight == 2){
                            var getChildrens = childIds[0].userId;
                            User.find({_id:getChildrens},async (err,res) => {
                                if(err) console.log(err);
                                var resChild = res[0].childIds;
                                if(resChild.length == 2){
                                    User.find({_id:childIds[1].userId},async (err,res2) => {
                                        var res2Child = res2[0].childIds;
                                        if(res2Child.length == 2){
                                            Queue.find({},async (err,resQ) => {

                                                var popFirst = resQ[0].queueList[0].userId;
                                                console.log(popFirst);
                                                let walletVal = await getAdminResult().then(resultAdmin => {
                                                    Queue.findByIdAndUpdate( {_id:resQ[0]._id}, { $pop: { queueList: -1 } },{useFindAndModify:false}).then( async updatedOne =>
                                                        {
                                                        await User.findByIdAndUpdate({_id:popFirst},{$set: {
                                                            childIds:[],
                                                            "payout.eligible":(2*resultAdmin.lvl1depfin)
                                                        },$inc:{stage:1,wallet: (2*resultAdmin.lvl1depfin)},$push:{transactions:{          
                                                                name:"Referral",
                                                                type:"Deposit",
                                                                amount:'+'+2*resultAdmin.lvl1depfin
                                                        }} },{useFindAndModify:false}).then(resultNew1 => {
                                                            User.find({_id:resultNew1._id},async (err,restt) => {
                                                                if(restt[0].stage > 10){
                                                                    await QueueOperations2(resultNew1._id).then(
                                                                    await QueueOperations(resultNew1._id)
                                                                    );
                                                                }
                                                                else{
                                                                    QueueOperations(resultNew1._id).then(
                                                                        resX => console.log(resX)
                                                                    );
                                                                }
                                                            })
                                                        })
                                                    })
                                                })
                                            }
                                            )
                                        }
                                    })
                                }
                            })
                        }
                        else{
                                let childLength = loopResult[0].childIds.length;
                                if(childLength == 0 || childLength == 1 ){
                                    if(!doneOps){
                                    loopResult[0].childIds.push({userId:userId});
                                    loopResult[0].transactions.push({
                                        name:"Added Referral",
                                        type:"credit",
                                        amount:'+500'
                                    });
                                    loopResult[0].save();
                                    const number = loopResult[0].number;
                                    var message = "Congrats! Your wallet balance is updated with +500 referral funds.";
                                    request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
                                    await getAdminResult().then(
                                        resultVal => {
                                    User.findByIdAndUpdate(
                                        {_id:userId},
                                        {$set: {
                                            action:true,
                                            wallet:resultVal.lvl1depfin,
                                            parentId: loopResult[0]._id
                                        },$push:{transactions: {
                                            name:"Initial Deposit",
                                            type:"Deposit",
                                            amount:'+'+resultVal.lvl1depfin
                                        }
                                        }},{useFindAndModify:false},(err,res2) => {
                                            if(err){console.log(err);}
                                        }
                                    )
                                        })
                                    Queue.find({},(err,gotRes) => {
                                        gotRes[0].queueList.push({userId:userId})
                                        gotRes[0].save()
                                    })
                                    .catch(err => {
                                        console.log(err)
                                    });
                                    doneOps = true;
                                    res(true)
                                    }
                                }
                            }
                        })
                    })
                }
            }
            }
        })
        }
        })
    })
}

updateTrans = (userId) => {
        return new Promise((resolve,reject) => {
        User.find({_id:userId},(err,resp) => {
        var getWall = resp[0].wallet;
        var getParent = resp[0].parentId;
        User.find({_id:getParent},(err2,resp2)=>{
            if(typeof resp2[0].parentId!='undefined'){
            var getParent2 = resp2[0].parentId;
                User.find({_id:getParent2},(err3,resp3)=>{
                    if(err3) console.log(err);
                }).then(
                    resNew => {
                    var parWall = resNew[0].wallet;
                    var wall1 = parseFloat(getWall)/2;
                    var wall = parseFloat(wall1)+parseFloat(parWall)
                    User.findOneAndUpdate({_id:getParent2},{$set:{'wallet':wall}},{useFindAndModify:false},(err,resp1) => {
                        if(err) console.log(err);
                        resp1[0].transactions.push({
                            name:"Referral",
                            type:"Deposit",
                            amount:'+'+wall1
                        })
                        resp2.save();
                    }).then(
                        resNew1 => {
                            User.find({_id:getParent},(err3,resp4)=>{
                                if(err3) console.log(err);
                            }).then(
                                resNew2 => {
                                var parWall = resNew2[0].wallet;
                                var wall1 = parseFloat(getWall)/2;
                                var wall = parseFloat(wall1)+parseFloat(parWall)
                                User.findOneAndUpdate({_id:getParent},{$set:{'wallet':wall}},{useFindAndModify:false},(err,resp2) => {
                                    if(err) console.log(err);
                                    resp2[0].transactions.push({
                                        name:"Referral",
                                        type:"Deposit",
                                        amount:'+'+wall1
                                    })
                                    resp2.save();
                                }).then(
                                    resolve(true)
                                )
                        }
                    )
                }
                )
                
            })
        }
        else{
            User.find({_id:getParent},(err3,resp3)=>{
            var parWall = resp3[0].wallet;
            var wall1 = parseFloat(getWall)/2;
            var wall = parseFloat(wall1)+parseFloat(parWall)
            User.findOneAndUpdate({_id:getParent},{$set:{'wallet':wall}},{useFindAndModify:false},(err,resp) => {
                if(err) console.log(err);
                resp[0].transactions.push({
                    name:"Referral",
                    type:"Deposit",
                    amount:'+'+wall1
                })
                resp2.save();
            })
            })
        }
    })
})
})
}

//Function for Queue Operations
function QueueOperations2(userId){
    return new Promise(function(res,rej){
        let doneOps = false;
        Queue.findOneAndUpdate({},{},{upsert:true,new:true,setDefaultsOnInsert: true,useFindAndModify: false}, (err,resElem) => {
            if(err) console.log(err);
            if(!resElem){
                newQueue = new Queue({
                    userId: userId
                });
                newQueue.save();
                res(true);
            }
            else {
            Queue.find({},async (err,resElems) => {
            let queueLength = resElems[1].queueList.length;
            if(queueLength == 0){
                resElems[1].queueList.push({userId:userId})
                resElems[1].save();
                await getAdminResult().then(
                    resultVal => {
                User.findByIdAndUpdate(
                    {_id:userId},
                    {$set: {
                        action:true,
                        wallet:resultVal.lvl1depfin
                    }},{useFindAndModify:false},(err,res2) => {
                        if(err){console.log(err);}
                        res2.transactions = {
                            name:"Initial Deposit",
                            type:"Deposit",
                            amount:'+'+resultVal.lvl1depfin
                        }
                        res2.save();
                        const number = parseInt(res2.number);
                        const message = "Congrats! Your wallet balance is updated with the deposit amount.";
                        request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
                    }
                )
                    }
                )
                res(true);
            }
            else{
            for(i=0;i<queueLength;i++){
                if(!doneOps){
                await User.find({_id:resElems[1].queueList[i].userId},async (err,loopResult) => {
                    if(err) console.log(err);
                    User.find({_id:loopResult[0]._id},async (err,result) => {
                        if(err)console.log(err);
                        var childIds = result[0].childIds;
                        var childWeight = result[0].childIds.length;
                        if(childWeight == 2){
                            var getChildrens = childIds[0].userId;
                            User.find({_id:getChildrens},async (err,res) => {
                                if(err) console.log(err);
                                var resChild = res[0].childIds;
                                if(resChild.length == 2){
                                    User.find({_id:childIds[1].userId},async (err,res2) => {
                                        var res2Child = res2[0].childIds;
                                        if(res2Child.length == 2){
                                            Queue.find({},async (err,resQ) => {

                                                var popFirst = resQ[0].queueList[0].userId;
                                                console.log(popFirst);
                                                let walletVal = await getAdminResult().then(resultAdmin => {
                                                    Queue.findByIdAndUpdate( {_id:resQ[0]._id}, { $pop: { queueList: -1 } },{useFindAndModify:false}).then( async updatedOne =>
                                                        {
                                                        await User.findByIdAndUpdate({_id:popFirst},{$set: {
                                                            childIds:[]
                                                        },$inc:{stage:1,wallet: (2*resultAdmin.lvl1depfin),"payout.eligible":(2*resultAdmin.lvl1depfin)},$push:{transactions:{          
                                                                name:"Referral",
                                                                type:"Deposit",
                                                                amount:'+'+2*resultAdmin.lvl1depfin
                                                        }} },{useFindAndModify:false}).then(resultNew1 => {
                                                            User.find({_id:resultNew1._id},async (err,restt) => {
                                                                if(restt[0].stage > 10){
                                                                    await QueueOperations3(resultNew1._id).then(
                                                                    await QueueOperations(resultNew1._id)
                                                                    );
                                                                }
                                                                else{
                                                                    QueueOperations(resultNew1._id).then(
                                                                        resX => console.log(resX)
                                                                    );
                                                                }
                                                            })
                                                        })
                                                    })
                                                })
                                            }
                                            )
                                        }
                                    })
                                }
                            })
                        }
                        else{
                                let childLength = loopResult[0].childIds.length;
                                if(childLength == 0 || childLength == 1 ){
                                    if(!doneOps){
                                    loopResult[0].childIds.push({userId:userId});
                                    loopResult[0].save();
                                    console.log("here")
                                    console.log("ID "+userId)
                                    await getAdminResult().then(
                                        resultVal => {
                                    User.findByIdAndUpdate(
                                        {_id:userId},
                                        {$set: {
                                            action:true,
                                            wallet:resultVal.lvl1depfin,
                                            parentId: loopResult[0]._id
                                        }},{useFindAndModify:false},(err,res2) => {
                                            if(err){console.log(err);}
                                            res2.transactions = {
                                                name:"Initial Deposit",
                                                type:"Deposit",
                                                amount:'+'+resultVal.lvl1depfin
                                            }
                                            res2.save();
                                        }
                                    )
                                        })
                                    resElems[1].queueList.push({userId:userId})
                                    resElems[1].save();
                                    doneOps = true;
                                    res(true)
                                    }
                                }
                            }
                        })
                    })
                }
            }
            }
        })
        }
        })
    })
}

//Function for Queue Operations
function QueueOperations3(userId){
    return new Promise(function(res,rej){
        let doneOps = false;
        Queue.findOneAndUpdate({},{},{upsert:true,new:true,setDefaultsOnInsert: true,useFindAndModify: false}, (err,resElem) => {
            if(err) console.log(err);
            if(!resElem){
                newQueue = new Queue({
                    userId: userId
                });
                newQueue.save();
                res(true);
            }
            else {
            Queue.find({},async (err,resElems) => {
            let queueLength = resElems[2].queueList.length;
            if(queueLength == 0){
                resElems[2].queueList.push({userId:userId})
                resElems[2].save();
                await getAdminResult().then(
                    resultVal => {
                User.findByIdAndUpdate(
                    {_id:userId},
                    {$set: {
                        action:true,
                        wallet:resultVal.lvl1depfin
                    }},{useFindAndModify:false},(err,res2) => {
                        if(err){console.log(err);}
                        res2.transactions = {
                            name:"Initial Deposit",
                            type:"Deposit",
                            amount:'+'+resultVal.lvl1depfin
                        }
                        res2.save();
                        const number = parseInt(res2.number);
                        const message = "Congrats! Your wallet balance is updated with the deposit amount.";
                        request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
                    }
                )
                    }
                )
                res(true);
            }
            else{
            for(i=0;i<queueLength;i++){
                if(!doneOps){
                await User.find({_id:resElems[2].queueList[i].userId},async (err,loopResult) => {
                    if(err) console.log(err);
                    User.find({_id:loopResult[0]._id},async (err,result) => {
                        if(err)console.log(err);
                        var childIds = result[0].childIds;
                        var childWeight = result[0].childIds.length;
                        if(childWeight == 2){
                            var getChildrens = childIds[0].userId;
                            User.find({_id:getChildrens},async (err,res) => {
                                if(err) console.log(err);
                                var resChild = res[0].childIds;
                                if(resChild.length == 2){
                                    User.find({_id:childIds[1].userId},async (err,res2) => {
                                        var res2Child = res2[0].childIds;
                                        if(res2Child.length == 2){
                                            Queue.find({},async (err,resQ) => {

                                                var popFirst = resQ[0].queueList[0].userId;
                                                console.log(popFirst);
                                                let walletVal = await getAdminResult().then(resultAdmin => {
                                                    Queue.findByIdAndUpdate( {_id:resQ[0]._id}, { $pop: { queueList: -1 } },{useFindAndModify:false}).then( async updatedOne =>
                                                        {
                                                        await User.findByIdAndUpdate({_id:popFirst},{$set: {
                                                            childIds:[]
                                                        },$inc:{stage:1,wallet: (2*resultAdmin.lvl1depfin),"payout.eligible":(2*resultAdmin.lvl1depfin)},$push:{transactions:{          
                                                                name:"Referral",
                                                                type:"Deposit",
                                                                amount:'+'+2*resultAdmin.lvl1depfin
                                                        }} },{useFindAndModify:false}).then(resultNew1 => {
                                                            User.find({_id:resultNew1._id},async (err,restt) => {
                                                                if(restt[0].stage > 10){
                                                                    await QueueOperations3(resultNew1._id).then(
                                                                    await QueueOperations(resultNew1._id)
                                                                    );
                                                                }
                                                                else{
                                                                    QueueOperations(resultNew1._id).then(
                                                                        resX => console.log(resX)
                                                                    );
                                                                }
                                                            })
                                                        })
                                                    })
                                                })
                                            }
                                            )
                                        }
                                    })
                                }
                            })
                        }
                        else{
                                let childLength = loopResult[0].childIds.length;
                                if(childLength == 0 || childLength == 1 ){
                                    if(!doneOps){
                                    loopResult[0].childIds.push({userId:userId});
                                    loopResult[0].save();
                                    console.log("here")
                                    console.log("ID "+userId)
                                    await getAdminResult().then(
                                        resultVal => {
                                    User.findByIdAndUpdate(
                                        {_id:userId},
                                        {$set: {
                                            action:true,
                                            wallet:resultVal.lvl1depfin,
                                            parentId: loopResult[0]._id
                                        }},{useFindAndModify:false},(err,res2) => {
                                            if(err){console.log(err);}
                                            res2.transactions = {
                                                name:"Initial Deposit",
                                                type:"Deposit",
                                                amount:'+'+resultVal.lvl1depfin
                                            }
                                            res2.save();
                                        }
                                    )
                                        })
                                    resElems[2].queueList.push({userId:userId})
                                    resElems[2].save();
                                    doneOps = true;
                                    res(true)
                                    }
                                }
                            }
                        })
                    }
                    )
                }
            }
            }
        })
        }
        })
    })
}

module.exports = router;