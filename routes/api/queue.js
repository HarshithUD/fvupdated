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
                lvl4dep:res[0].lvl4dep,
                lvl4ser:res[0].lvl4ser,
                lvl4depfin:(res[0].lvl4dep - res[0].lvl4ser),
                lvl5dep:res[0].lvl5dep,
                lvl5ser:res[0].lvl5ser,
                lvl5depfin:(res[0].lvl5dep - res[0].lvl5ser),
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
    var referreris = await getUserDetails(_id);
    var doInitial = await addInitialVal(_id,referreris.referrer);
    var getTree = await getUserTree(_id,referrer);
    // Do initial Process
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

// Get Descendants
async function getDescandants(_id){
    let tree = new Stack();
    var userInfo = await getUserDetails(_id);
    if(userInfo !== null){
    if(userInfo.stage === 1){
        var directChild = userInfo.childIds;
        if(directChild.length === 2){
            // Get First child's child
            var getFirstChild = await getChildren(userInfo.childIds[0].userId);
            // Get Second Child's child
            var getSecondChild = await getChildren(userInfo.childIds[1].userId);
            // Get count
            var countChild = getFirstChild.length + getSecondChild.length;
            if(countChild === 4){
                // var checkForInitialStage = checkForStage(tree);
                await upgradeStage(_id);
            }
            else{
                return;
            }
        }
        else if(directChild.length === 1){
            // Get First child's child
            var getFirstChild = await getChildren(userInfo.childIds[0].userId);
            var countChild = getFirstChild.length;
            console.log('CC '+countChild);
            if(userInfo.childUpgraded.length > 0 && countChild === 2){
                console.log('Here')
                await upgradeStage(_id);
            }
            return;
        }
    }
}
    return;
}

// Get Descendants
async function getDescandantsStage2P(_id){
    let tree = new Stack();
    var userInfo = await getUserDetails(_id);
    if(userInfo !== null){
        var directChild = userInfo.childIds;
        if(directChild.length === 2){
            // Get First child's child
            var getFirstChild = await getChildren(userInfo.childIds[0].userId);
            // Get Second Child's child
            var getSecondChild = await getChildren(userInfo.childIds[1].userId);
            // Get count
            var countChild = getFirstChild.length + getSecondChild.length;
            if(countChild === 4){
                // var checkForInitialStage = checkForStage(tree);
                await upgradeStage2P(_id);
            }
            else{
                return;
            }
        }
        else{
            return;
        }
}
    return;
}

//initial Stage upgrade
async function upgradeStage(_id){
    var adminData = await getAdminResult();
    var getHisPaar = await getUserDetails(_id);
    var stageUpgrade = await User.findOneAndUpdate({_id},{
        $set:{
            stage:2,
            childIds:[],
            parentId:null
        },
        $push:{
            transactions:{          
                name:"Deposit",
                type:"Deposit",
                amount:'-'+adminData.lvl1depfin
            }
        },
        $inc:{
            wallet:-(adminData.lvl1depfin),
            "payout.eligible":(3*adminData.lvl1depfin)-(adminData.lvl1depfin)
        }
    },{useFindAndModify:false});
    var checkTempParent = await parentCheck(_id,getHisPaar.parentId);
    var stageUpgrade = await stageUpgradation(_id);
    return stageUpgrade;
}

// Parent check for upgrade
async function parentCheck(_id,parent){
    let resultChild = null;
    if(parent !== null){
        var childrenofPar = await getUserDetails(parent);
            if(childrenofPar.childIds.length > 0){
                var getChildrens = childrenofPar.childIds;
                if(getChildrens[0].userId === _id){
                    if(typeof getChildrens[1] !== 'undefined'){
                        resultChild = getChildrens[1].userId;
                    }
                }
                else{
                    resultChild = getChildrens[0].userId;
                }
            }
            if(resultChild !== null){
                var remPar = await User.findOneAndUpdate({_id:parent,stage:1},{
                    $push:{
                        childUpgraded:{
                            userId:_id
                        }
                    },
                    $set:{
                        childIds:{
                            userId:resultChild
                        }
                    }
                },{
                    useFindAndModify:false
                });
            }
            else{
                var remPar = await User.findOneAndUpdate({_id:parent,stage:1},{
                    $push:{
                        childUpgraded:{
                            userId:_id
                        }
                    },
                    $set:{
                        childIds:[]
                    }
                },{
                    useFindAndModify:false
                });
            }
            return;
    }
}

// get next level
async function getNextLevel(level){
    if(level === 'silver'){
        return 'gold';
    }
    else if(level === 'gold'){
        return 'emerald';
    }
    else if(level === 'emerald'){
        return 'ruby';
    }
    else if(level === 'ruby'){
        return 'diamond';
    }
    else {
        return 'diamond';
    }
}

// Get admin amount
async function adminAmount(adminData,level){
    if(level === 'silver'){
        return adminData.lvl1depfin;
    }
    else if(level === 'gold'){
        return adminData.lvl2depfin;
    }
    else if(level === 'emerald'){
        return adminData.lvl3depfin;
    }
    else if(level === 'ruby'){
        return adminData.lvl4depfin;
    }
    else if(level === 'diamond'){
        return adminData.lvl5depfin;
    }
}

//initial Stage upgrade
async function upgradeStage2P(_id){
    var getUserInfos = await getUserDetails(_id);
    var nextLevel = await getNextLevel(getUserInfos.level);
    var adminData = await getAdminResult();
    var getAmount = await adminAmount(adminData,getUserInfos.level)
    if(getUserInfos.stage <= 5){
    var stageUpgrade = await User.findOneAndUpdate({_id},{
        $set:{
            childIds:[],
            parentId:null
        },
        $push:{
            transactions:{          
                name:"Deposit",
                type:"Deposit",
                amount:'-'+getAmount
            }
        },
        $inc:{
            stage:1,
            wallet:-(getAmount),
            "payout.eligible":(3*getAmount)-(getAmount)
        }
    },{useFindAndModify:false});
    // let number = stageUpgrade.number;
    // const message = "Congrats! Your wallet balance is updated with."+(3*getAmount)-(getAmount)+" referral funds.";
    // request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
    }
    else if(getUserInfos.stage > 5 && getUserinfos.stage < 10){
        var stageUpgrade = await User.findOneAndUpdate({_id},{
            $set:{
                childIds:[],
                parentId:null
            },
            $push:{
                transactions:{          
                    name:"Deposit",
                    type:"Deposit",
                    amount:'-'+getAmount
                }
            },
            $inc:{
                stage:1,
                wallet:-(getAmount)
            }
        },{useFindAndModify:false})
    }
    else if(getUserInfos.stage === 10 && getUserInfos.level !== 'diamond'){
        var stageUpgrade = await User.findOneAndUpdate({_id},{
            $set:{
                childIds:[],
                stage:1,
                level:nextLevel,
                wallet:getUserInfos.payout.eligible,
                parentId:null
            },
            $push:{
                transactions:{          
                    name:"Deposit",
                    type:"Deposit",
                    amount:'-'+(getUserInfos.wallet-getUserInfos.payout.eligible)
                }
            }
        },{useFindAndModify:false});
        // let number = stageUpgrade.number;
        // const message = "Congrats! You are now "+nextLevel.toUpperCase()+" member with Fortune Vision Family.";
        // request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
    }
    else{
        return;
    }
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
        }}},{useFindAndModify:false,new:true},async (errors,result)=>{
            if(errors){
                console.log(errors);
            }
            else{
                // let number = result.number;
                // const message = "Congrats! You are now SILVER member with Fortune Vision Family.";
                // request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
                if(result.parentId !== null){
                var update1 = await User.findByIdAndUpdate({_id:result.parentId,stage:result.stage,level:result.level},{$push:{
                    childIds:{
                        userId:result._id
                    },
                    transactions:{          
                        name:"Referral",
                        type:"Credit",
                        amount:'+'+(0.5*adminData.lvl1depfin)
                    }
                },
                $inc:{
                    wallet:0.5*(adminData.lvl1depfin)
                }
            },{useFindAndModify:false});
            if(update1.parentId !== null){
            var update2 = await User.findOneAndUpdate({_id:update1.parentId},{
                $push:{
                    transactions:{          
                        name:"Referral",
                        type:"Credit",
                        amount:'+'+(0.5*adminData.lvl1depfin)
                    }
                },
                $inc:{
                    wallet:(0.5*adminData.lvl1depfin)
                }
            },{useFindAndModify:false});
            }
            }
            }
        })
        return;
    }
}

// check for parent upgrade
async function checkForStageUpgrade(_id){
    // Get Parent
    var getHisParent = await getParent(_id);
    if(getHisParent !== null){
            var upg = await getDescandantsStage2P(getHisParent);
            return;
    }
    else{
        return;
    }
    return;
}

// admin amount for level 2+
async function adminAmountStage2P(_id){
    var user = await getUserDetails(_id);
    var adminData = await getAdminResult();
    let level = user.level;
    if(level === 'silver'){
        return adminData.lvl1depfin;
    }
    else if(level === 'gold'){
        return adminData.lvl2depfin;
    }
    else if(level === 'emerald'){
        return adminData.lvl3depfin;
    }
    else if(level === 'ruby'){
        return adminData.lvl4depfin;
    }
    else if(level === 'diamond'){
        return adminData.lvl5depfin;
    }
}

// Stage 2 + Upgrade 
async function stageUpgradation(_id){
    // Upgrade Stage
    var getUser = await getUserDetails(_id);
    var userStage = getUser.stage;
    var userLevel = getUser.level;
    // check if there is any same Staged user in new stage
    var IfQueueExists = await User.find({stage:userStage});
    if(IfQueueExists.length === 1){
        // If first time it enters new Queue
        var reset = await User.findOneAndUpdate({_id},{
            $set:{
                childIds:[],
                parentId:null
            }
        },{useFindAndModify:false})
    }
    else{
        var resStack = new Stack();
        IfQueueExists.forEach( async (elem,index) => {
            if(elem.childIds.length >= 0 && elem.childIds.length < 2 && !elem._id.equals(_id)){
                if(resStack.items.length === 0){
                resStack.items.push(elem._id);
            }
            }
        })
        if(resStack.items.length === 1){
            console.log(resStack.items);
            var getAdminAmount = await adminAmountStage2P(resStack.items[0]);
                var updateChildodUser = await User.findOneAndUpdate({_id:resStack.items[0],stage:getUser.stage,level:getUser.level},{
                    $push:{
                        childIds:{userId:_id},
                        transactions:{
                            name:"Referral",
                            type:"Credit",
                            amount:'+'+(0.5*getAdminAmount)
                        }
                    },
                    $inc:{
                        wallet:0.5*getAdminAmount
                    }
                },{useFindAndModify:false});
                if(updateChildodUser !== null && updateChildodUser.parentId !== null){
                    var update1 = await User.findOneAndUpdate({_id:updateChildodUser.parentId},{
                        $push:{
                            transactions:{
                                name:"Referral",
                                type:"Credit",
                                amount:'+'+(0.5*getAdminAmount)
                            }
                        },
                        $inc:{
                            wallet:0.5*getAdminAmount
                        }
                    },{useFindAndModify:false})
                }
                var updatePar = await User.findOneAndUpdate({_id},{
                    $set:{parentId:resStack.items[0]}
                },{useFindAndModify:false})
                await checkForStageUpgrade(resStack.items[0]);
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
    // var a = new Admin({
    //     name:'admin1',
    //     password:'$2a$10$E666CKc8wDxC2DL0YJ95t.lCK.jUxkl1BwYdE/xSsKu5QnKKVUutK',
    //     email:'admin1@undigit.com'
    // });
    // a.save()
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