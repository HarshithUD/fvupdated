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

//Get user details
async function getUserDetails(_id){
    var userdetails = await User.findOne({_id});
    return userdetails;
}

//Get User Parent by referrer ID
async function getReferrerId(referrerId){
    var getUser = await User.findOne({_id:referrerId});
    var parentId = await User.findOne({referralId:getUser.referrer})
    return parentId;
}

//Filter Unique values in array or stack
//only unique elems
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

class Stack{
    constructor(){
        this.items = [];
    }
}

//Get Ancestor of a user
async function getAncestors(_id){
    console.log("ID: "+_id)
    let parentId = await getReferrerId(_id);
    console.log(parentId)
    let Ancestors = new Stack;
    while(parentId !== null){
        Ancestors.items.push(parentId);
        var userParent = await getUserDetails(parentId);
        parentId = userParent.parentId;
    }
    let AllAncestors = Ancestors.items.filter( onlyUnique );
    return AllAncestors;
}

//Get Childrens
async function getChildrens(_id){
    var childrens = await User.findOne({_id});
    return childrens.childIds;
}

//Get next level
async function findNextLevel(currentLevel){
    let nextLevel = '';
    if(currentLevel === 'silver'){
        nextLevel = 'gold';
        return nextLevel;
    }
    else if(currentLevel === 'gold'){
        nextLevel = 'sapphire';
        return nextLevel;
    }
    else if(currentLevel === 'sapphire'){
        let error = {
            error:true,
            message:'Upgraded completetely'
        }
        return error;
    }
    return;
}

//Get all descendants of a user
async function getAllDescendants(_id){
    //implementing Bread first algorithm for getting all descendants of particular user
    var finalStack = new Stack();
    var outputStack = new Stack();
    outputStack.items.push(_id);
    while(outputStack.items.length !== 0){
        let checkingAncestor = outputStack.items[0];
        var getAncestorChildren = await getChildrens(checkingAncestor);
        for(i=0;i<getAncestorChildren.length;i++){
            outputStack.items.push(getAncestorChildren[i].userId);
        }
        let nextEle = outputStack.items.shift();
        finalStack.items.push(nextEle);
    }
    var ancestorId = finalStack.items.shift();
    let AllDescendants = finalStack.items.filter( onlyUnique );
    return AllDescendants;
}

//Start the Queue Operations
async function QueueOperation(_id){
    //get all ancestors
    var ancestorsOfUser = await getAncestors(_id);
    console.log(ancestorsOfUser)
    ancestorsOfUser.forEach( async (ele,index) => {
        // do upgrade process if necessary
        var doInitialUpgrade = await processUpgrade(ele);
    })
}

//process upgrade when user gets approved for first time
async function processUpgrade(_id){
    var userDets = await getUserDetails(_id);
    if(userDets.stage === 1){
        var userDescendants = await getAllDescendants(_id);
        console.log('here')
        if(userDescendants.length === 5){
            //Carry out initial upgrade
            var userupgrade = await upgradeStage(_id);
            console.log('***************');
            console.log('User initial upgrade: '+userupgrade);
            console.log('***************');
            //Check if any User has six upgrades of same stage then upgrade it
            var stage = 2;
            let level = 'silver';
            var ancestorUpgrade = await ancestorUpgrades(_id,stage,level);
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
    return stageUpgrade;
}

//Upgrade whenever there is any upgrades
async function ancestorUpgrades(_id,stage,level){
    //storing upgrade information in every ancestor
    //get all ancestors and remember about upgrade to every ancestor of that user
    var userAncestors = await getAncestors(_id);
    userAncestors.forEach(async (ele,index) => {
        var ancDets = await getUserDetails(ele);
        if(ancDets.stage === stage && ancDets.stage <= 5 && ancDets.level === level){
            if(ancDets.childUpgraded.length < 5){
                var storeUpgrade = await User.findOneAndUpdate({_id:ancDets._id},{
                    $push: {
                        childUpgraded:{
                            userId:_id
                        }
                    }
                },{useFindAndModify:false})
            }
            else if(ancDets.childUpgraded.length === 5){
                var stageUpgrade = await StageUpgrades(ancDets._id,_id);
            }
            else if(ancDets.childUpgraded.length === 6){
                var storeUpgrade = await User.findOneAndUpdate({_id:ancDets._id},{
                    $set: {
                        childUpgraded:{
                            userId:_id
                        }
                    }
                },{useFindAndModify:false})
            }
        }
        else if(ancDets.stage === stage && 10 > ancDets.stage &&  ancDets.stage > 5 && ancDets.level === level){
            // Do stage 5 + process for 5 referrals initially 
            // ----------------------------------------------
            if(ancDets.childUpgraded.length < 5){
                var storeUpgrade = await User.findOneAndUpdate({_id:ancDets._id},{
                    $push: {
                        childUpgraded:{
                            userId:_id
                        }
                    }
                },{useFindAndModify:false})
            }
            else if(ancDets.childUpgraded.length === 5){
                //Upgrade Stage not eligible for payout
                var stageUpgrade = await MidStageUpgrades(ancDets._id,_id);
            }
            else if(ancDets.childUpgraded.length === 6){
                var storeUpgrade = await User.findOneAndUpdate({_id:ancDets._id},{
                    $set: {
                        childUpgraded:{
                            userId:_id
                        }
                    }
                },{useFindAndModify:false})
            }
        }
        else if(ancDets.stage === stage && ancDets.stage === 10 && ancDets.level === level){
            if(ancDets.childUpgraded.length < 5){
                var storeUpgrade = await User.findOneAndUpdate({_id:ancDets._id},{
                    $push: {
                        childUpgraded:{
                            userId:_id
                        }
                    }
                },{useFindAndModify:false})
            }
            else if(ancDets.childUpgraded.length === 5){
                //If a level's stage is completed
                var stageUpgrade = await finalStageUpgrade(ancDets._id,_id,ancDets.level);
            }
            else if(ancDets.childUpgraded.length === 6){
                var storeUpgrade = await User.findOneAndUpdate({_id:ancDets._id},{
                    $set: {
                        childUpgraded:{
                            userId:_id
                        }
                    }
                },{useFindAndModify:false})
            }
        }
    })
}

//Stage upgrades if stage if 5 and less
async function StageUpgrades(ancestorId,_id){
    var adminData = await getAdminResult();
    var doUpgrade = await User.findOneAndUpdate({_id:ancestorId},{
        $push:{
            childUpgraded:{
                userId:_id
            },
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
            stage:1,
            wallet:(3*adminData.lvl1depfin)-(adminData.lvl1depfin),
            "payout.eligible":(3*adminData.lvl1depfin)-(adminData.lvl1depfin)
        }
    },{useFindAndModify:false})
    // remember this upgrade and loop through stage upgrade process
    var didOps = await getUserDetails(ancestorId);
    var doStageOps = await ancestorUpgrades(ancestorId,didOps.stage,didOps.level);
    console.log('******************************')
    console.log('Upgraded Users: ');
    console.log(doUpgrade);
    console.log(doStageOps)
    console.log('******************************')
    return;
}

//Stage upgrades if Stage is between 5 & 10
async function MidStageUpgrades(ancestorId,_id){
    var adminData = await getAdminResult();
    var doUpgrade = await User.findOneAndUpdate({_id:ancestorId},{
        $push:{
            childUpgraded:{
                userId:_id
            },
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
            stage:1,
            wallet:(3*adminData.lvl1depfin)-(adminData.lvl1depfin)
        }
    },{useFindAndModify:false})
    // remember this upgrade and loop through stage upgrade process
    var didOps = await getUserDetails(ancestorId);
    var doStageOps = await ancestorUpgrades(ancestorId,didOps.stage,didOps.level);
    console.log('******************************')
    console.log('Upgraded Users: ');
    console.log(doUpgrade);
    console.log(doStageOps)
    console.log('******************************')
    return;
}

//Stage upgrades if Stage is 10 or When a level is completed
async function finalStageUpgrade(ancestorId,_id,level){
    var nextLevel = await findNextLevel(level);
    if(typeof nextLevel.error !== 'undefined'){
        let error = {
            error:true,
            message:'Upgrade fully completed'
        }
    }
    else{
        var getUserinfo = await getUserDetails(ancestorId);
    var doUpgrade = await User.findOneAndUpdate({_id:ancestorId},{
        $push:{
            childUpgraded:{
                userId:_id
            },
            transactions:[{          
                name:"Deposit",
                type:"Deposit",
                amount:'-'+(getUserDetails.wallet - getUserDetails.payout.eligible)
            }]
        },
        $set:{
            stage:1,
            wallet:getUserDetails.payout.eligible,
            level:nextLevel
        }
    },{useFindAndModify:false})
    // remember this upgrade and loop through stage upgrade process
    var didOps = await getUserDetails(ancestorId);
    var doStageOps = await ancestorUpgrades(ancestorId,didOps.stage,didOps.level);
    console.log('******************************')
    console.log('Upgraded Users: ');
    console.log(doUpgrade);
    console.log(doStageOps)
    console.log('******************************')
    return;
    }
}

// @route GET api/queue/approve/userId
// @desc Approve user
// @access Admin
router.get('/approve/:userid',async (request,response) => {
    var _id = request.params.userid;
    //get referrer details who is a parent of this user
    var doQueueOperations = await QueueOperation(_id);
    var userDetailsis = await getUserDetails(_id);
    var addToQueue = await addInitialVal(_id,userDetailsis.referrer);
    response.send(addToQueue);
})

//count approved users
async function countUsers(){
    var appUsers = await User.find({action:true});
    return appUsers.length;
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