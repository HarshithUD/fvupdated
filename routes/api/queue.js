const express = require('express');
const router = express.Router()
const User = require('../../models/User')
const Queue = require('../../models/Queue')
const Admin = require('../../models/Admin')
var request=require('request');

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

// @route GET api/queue/approve/userId
// @desc Approve user
// @access Admin
router.get('/approve/:userid',async (request,response) => {
    //get userid
    let _id = request.params.userid;
    //get referrer details who is a parent of this user
    var referrer = await getReferrer(_id);
    // Get user tree structure
    var getTree = await getUserTree(_id,referrer);
    // Do initial Process
    var referreris = await getUserDetails(_id);
    var doInitial = await addInitialVal(_id,referreris.referrer);
    response.send(doInitial);
});

//Get Parent
async function getReferrer(_id){
    var userInfo = await getUserDetails(_id);
    if(userInfo.referrer !== null){
        var getReferrer = await User.findOne({referralId:userInfo.referrer});
        return getReferrer;
    }
    else{
        return null;
    }
}

//count approved users
async function countUsers(){
    var appUsers = await User.find({action:true});
    return appUsers.length;
}

//Get User Details
async function getUserDetails(_id){
    var userDets = await User.findOne({_id});
    return userDets;
}

// Get Parent
async function getParent(_id){
    if(_id !== null || typeof _id !== 'undefined'){
        var parent = await User.findOne({_id});
        if(parent !== null){
            if(parent.parentId !== null){
                return parent.parentId;
            }
        }
        else{
            return null;
        }
    }
    else return null;
}

// Get His Parent
async function getUserTree(_id,hisParent){
    // get's Parent Parent
    if(hisParent !== null){
        var parentId = await getParent(hisParent._id);
        if(parentId !== null){
            var userTree = await getDescandants(parentId);
            return;
        }
    }
    return;
}

class Stack{
    constructor(){
        this.items = [];
    }
}

// Get children
async function getChildren(_id){
    var getUserInfo = await getUserDetails(_id);
    var userChild = getUserInfo.childIds;
    return userChild;
}

// Check for Stage
async function checkForStage(tree){
    for(i=0;i<tree.items.length;i++){
        console.log(tree.items[0])
    }
}

// Get Descendants
async function getDescandants(_id){
    let tree = new Stack();
    var userInfo = await getUserDetails(_id);
    if(userInfo !== null){
    if(userInfo.stage === 1){
        var directChild = userInfo.childIds;
        tree.items.push(userInfo.childIds[0].userId);
        tree.items.push(userInfo.childIds[1].userId);
        if(directChild.length === 2){
            // Get First child's child
            var getFirstChild = await getChildren(userInfo.childIds[0].userId);
            // Get Second Child's child
            var getSecondChild = await getChildren(userInfo.childIds[1].userId);
            // Get count
            var countChild = getFirstChild.length + getSecondChild.length;
            console.log(getFirstChild.length)
            if(countChild === 3){
                tree.items.push(getFirstChild[0].userId);
                tree.items.push(getSecondChild[0].userId);
                tree.items.push(getFirstChild[1].userId);
                // var checkForInitialStage = checkForStage(tree);
                await upgradeStage(_id);
            }
            else{
                return;
            }
        }
        else{
            return;
        }
    }
}
    return;
}

//initial Stage upgrade
async function upgradeStage(_id){
    var adminData = await getAdminResult();
    var stageUpgrade = await User.findOneAndUpdate({_id},{
        $set:{
            stage:2
        },
        $push:{
            transactions:[{          
                name:"Referral",
                type:"Deposit",
                amount:'+'+3*adminData.lvl1depfin
            },
            {          
                name:"Deposit",
                type:"Deposit",
                amount:'-'+adminData.lvl1depfin
            }]
        },
        $inc:{
            wallet:(3*adminData.lvl1depfin)-(adminData.lvl1depfin),
            "payout.eligible":(3*adminData.lvl1depfin)-(adminData.lvl1depfin)
        }
    },{useFindAndModify:false})
    var stageUpgrade = await stageUpgradation(_id);
    return stageUpgrade;
}

//Add initial Values
async function addInitialVal(_id,referrer){
    var referrerData = await User.findOne({referralId:referrer});
    var referrers = await User.find({referrer:referrer,action:true});
    var count = await countUsers();
    if(count === 0){
        referrerData = {
            _id:null,
            childIds:[]
        }
        referrerData.childIds = [];
    }
    if(referrers.length>=2){
        result = {
            error:true,
            message:'Referrals Filled completetly'
        }
        return result;
    }
    else{
        //Get Admin data
        const adminData = await getAdminResult();
        var initialDeposit = adminData.lvl1depfin;
        var refBonus = (adminData.lvl1depfin)/2;
        // Add user to the Parent
        await User.findByIdAndUpdate({_id},{$set:{
            action:true,
            level:'silver',
            parentId:referrerData._id,
            transactions: {
            name:"Initial Deposit",
            type:"Deposit",
            amount:'+'+initialDeposit
        }}},{useFindAndModify:false,new:true},(errors,result)=>{
            if(errors){
                console.log(errors);
            }
            else{
                if(result.parentId !== null){
                User.findByIdAndUpdate({_id:result.parentId},{$push:{
                    childIds:{
                        userId:result._id
                    }
                }},{useFindAndModify:false},async (err,res)=>{
                    if(err){console.log(err)}
                })
            }
            }
        })
        return;
    }
}

// Stage 2 + Upgrade 
async function stageUpgradation(_id){
    // Upgrade Stage
    var getUser = await getUserDetails(_id);
    var userStage = getUser.stage;
    var userLevel = getUser.level;
    var exi = await Queue.find({});
    if(exi.length === 0){
        newQueue = new Queue({
            userId:_id,
            stage:userStage,
            level:userLevel
        })
        newQueue.save();
    }
    else{
        // Checking for weight 6
        var getQueueList = await Queue.find({stage:userStage,level:userLevel});
        if(getQueueList.length < 6){
            // newQueue = new Queue({
            //     userId:_id,
            //     stage:userStage,
            //     level:userLevel
            // })
            // newQueue.save();
            var x = await Queue.insertMany(
                {
                    userId:_id,
                    stage:userStage,
                    level:userLevel
                }
            );
            console.log(x)
        }
        if(getQueueList.length === 6){
            // Upgrade Stage of the First User
            var upgradingUser = getQueueList.shift();
            var upgrading = await upgradeUser(upgradingUser);
            return;
        }
    }
    return;

}

// Upgrade User
async function upgradeUser(user){
    var getUserInfo = await getUserDetails(user.userId);
    if(getUserInfo.stage < 10){
        var upgrade = await User.findOneAndUpdate({_id:user.userId},{
            $inc:{stage:1}
        },{useFindAndModify:false});
        // Move to next stage queue
        var upgradeInQueue = await Queue.findOneAndUpdate({userId:user.userId},{
            $inc:{stage:1}
        },{useFindAndModify:false})
        return;
    }
    else if(getUserInfo.stage === 10){
        var upgrade = await User.findOneAndUpdate({_id:user.userId},{
            $set:{stage:1,level:'gold'}
        },{useFindAndModify:false});
        // Move to next stage queue
        var upgradeInQueue = await Queue.findOneAndUpdate({userId:user.userId},{
            $set:{stage:1,level:'gold'}
        },{useFindAndModify:false})
        return;
    }
}

//Reset complete databse
setTimeout( async () => {
    // reset();
},3000)

async function reset(){
    var resett = await User.updateMany({},{
        $set:{
            action:false,
            childIds:[],
            transactions:[],
            wallet:0,
            childUpgraded:[],
            stage:1,
            'payout.eligible':0,
            parentId:null
        }
    },(err,res) => {
        if(err)console.log(err);
    })
    console.log(resett);
}

module.exports = router;