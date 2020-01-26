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

// @route GET api/queue/approve
// @desc Approve user
// @access Public
router.get('/approve/:userid',async (request,response) => {
    //user id
    var userid = request.params.userid;
    //get refferral id
    var referrerInfo = await User.findOne({_id:userid});
    var referrer = referrerInfo.referrer;
    if(typeof referrer === 'undefined'){
        let result = {
            error:true,
            message:'No refferrals'
        }
        response.send(result);
    }
    else{
        var count = await countUsers();
        if(count!==0){
            var referrerDetails = await User.findOne({referralId:referrer});
            if(referrerDetails === null){
                let result = {
                    error:true,
                    message:'Referrer Not found'
                }
                response.send(result);
            }
            const referrerData = {
                childIds:referrerDetails.childIds,
                parentId:referrerDetails._id
            }
            // var getUserLevlStage = await getStageNLevel(userid);
                const checkParentDesc = await checkAncestors(referrerDetails._id);
                const result = await QueueOperations(referrerData,userid);
                response.send(result);
        }
        else if(count === 0){
            // var referrerDetails = await User.findOne({referralId:referrer});
            const referrerData = {
                childIds:[],
                parentId:null
            }
            const result = await QueueOperations(referrerData,userid);
            response.send(result);
        }
    }
})

async function getStageNLevel(_id){
    var res = await User.findOne({_id});
    let userIn = {
        stage:res.stage,
        level:res.level
    }
    return userIn;
}

async function countUsers(){
    var a = await User.find({action:true});
    return a.length;
}

//upgrade Operation
async function checkAncestors(userid){
    //Get Ancestors of a child
    var parentToCheck = userid;
    var checked = [];
    let getAncestorId = await checkForParent(parentToCheck);
    if(getAncestorId!==null){
        while(getAncestorId!==null){
            checked.push(getAncestorId);
            // Get Descendants of User
            var x = await getDecendants(getAncestorId);
            //Check remaining descendants
            getAncestorId = await checkForParent(getAncestorId);
        }
    }
    return;
}

//Define Stack class
// Stack class 
class Stack { 
    // Array is used to implement stack 
    constructor() 
    { 
        this.items = []; 
    } 
}

//Breadth First Algorithm
async function getDecendants(ancId){
var finalStack = new Stack();
var outputStack = new Stack();
var searched = new Stack();
    outputStack.items.push(ancId)
    while(outputStack.items.length!==0){
        var toCheck = outputStack.items[0];
        var getChildren = await getChildrens(toCheck);
        for(i=0;i<getChildren.length;i++){
            outputStack.items.push(getChildren[i].userId);
        }
        var nextEle = outputStack.items.shift();
        finalStack.items.push(nextEle);
    }
    var parent = finalStack.items.shift();
    let finalEles = finalStack.items.filter( onlyUnique );
    var checkPstages = await getUserStage(parent);
    if(checkPstages===1){
        var childrensAt = await checkAllChildren(finalEles);
        var isChildSameStage = childrensAt.every(isSameStage);
        var updateRef = await updateReff(parent);
        if(finalEles.length===5 && isChildSameStage){
            var x = await getAdminResult();
            var updateUser = await User.findOneAndUpdate({_id:parent},{$set:{stage:2},
                $push:{
                    transactions:[{          
                        name:"Referral",
                        type:"Deposit",
                        amount:'+'+3*x.lvl1depfin
                    },
                    {          
                        name:"Deposit",
                        type:"Deposit",
                        amount:'-'+x.lvl1depfin
                    }]
                },
                $inc:{
                    wallet:(3*x.lvl1depfin)-(x.lvl1depfin),
                    "payout.eligible":(3*x.lvl1depfin)-(x.lvl1depfin)
                }
            },{useFindAndModify:false});
            var checkUpgrade = await doStageOperation(updateUser,updateUser)
            const message = "Congrats! Your wallet balance is updated with +"+ 3*x.lvl1depfin +"Refferral funds.";
            request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+updateUser.number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
            console.log(updateUser)
        }
        else if(!isChildSameStage){
        }
        else{
        }
    }
    return finalEles;
}

//only unique elems
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

//
const isSameStage = (currentValue) => currentValue === 1;

//Get Childrens
async function getChildrens(_id){
    var childrens = await User.findOne({_id});
    return childrens.childIds;
}

// check all children stage
async function checkAllChildren(_id){
    let resArr = [];
    for(i=0;i<_id.length;i++){
        var result = await User.findOne({_id});
        var res = result.stage;
        resArr.push(res)
    }
    return resArr;
}

//Get User level
async function getUserStage(_id){
    var res = await User.findOne({_id});
    return res.stage;
}

//check for parent
async function checkForParent(userId){
    var result = await User.findOne({_id:userId});
    var parent_id = result.parentId;
    if(parent_id !== null || (parent_id!=='')){
        var getHisParent = result.parentId;
        return getHisParent;
    }
    else{
        return null;
    }
}

//Stage Upgrade
async function doStageOperation(user,user2){
    var _id = user._id;
    var x = await getAdminResult();
    let refBonus = (x.lvl1depfin)/2;
    var userInfo = await User.findOne({_id:user2._id});
    var userParent = userInfo.parentId;
    if(userParent !== null){
        var parentInfo = await User.findOne({_id:userParent});
        var getChildUpgraded = parentInfo.childUpgraded;
        var getMainUserInfo = await User.findOne({_id:user._id});
        var x1 = userInfo.stage;
        if(getMainUserInfo.stage === x1){
        if(getChildUpgraded.length < 5){
        var updateInfo = await User.findOneAndUpdate({_id:userParent},{$push:{
            childUpgraded:{
                userId:user._id
            },
            transactions: {
                name:"Referral Joined",
                type:"Deposit",
                amount:'+'+refBonus
            }
        }})
        }
        else if(getChildUpgraded.length === 5){
        var updateInfo = await User.findOneAndUpdate({_id:userParent},{$push:{
            childUpgraded:{
                userId:user._id
            },
            transactions: {
                name:"Referral Joined",
                type:"Deposit",
                amount:'+'+refBonus
            }
        }})
        //Upgrade parent
        let upgradeParentx = await upgradeParent(userParent);
        // remember his ancestors too
        if( parentInfo.parentId !== null ){
                var stagOp = await doStageOperation(user,parentInfo._id);
        }
        // ********
        }
        else if(getChildUpgraded.length === 6){
        var updateInfo = await User.findOneAndUpdate({_id:userParent},{$set:{
            childUpgraded:{
                userId:user._id
            }
        },
        $push:{
            transactions: {
                name:"Referral Joined",
                type:"Deposit",
                amount:'+'+refBonus
            }
        }},
        )
        }
    }
    }
    return;
}

//upgrade parent
async function upgradeParent(_id){
    var x = await getAdminResult();
    var xxx = await getUserStage(_id);
    if(xxx < 6){
    var upgraded = await User.findOneAndUpdate({_id},{$inc:
        {
            stage:1,
            wallet:(3*x.lvl1depfin)-(x.lvl1depfin),
            "payout.eligible":(3*x.lvl1depfin)-(x.lvl1depfin)
        }
    },
    {
        $push:{
            transactions:[{   
                name:"Referral",
                type:"Deposit",
                amount:'+'+3*x.lvl1depfin
            },
            {          
                name:"Deposit",
                type:"Deposit",
                amount:'-'+x.lvl1depfin
            }]
        }
    }
    );
    const message = "Congrats! Your wallet balance is updated with +"+ 3*x.lvl1depfin +"Refferral funds.";
    request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+upgraded.number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
    if(upgraded.parentId !== 'null' || typeof upgraded !== 'undefined'){
        var res = await doStageOperation(upgraded,upgraded);
    }
    return upgraded;
}else if(xxx < 10){
    var upgraded = await User.findOneAndUpdate({_id},{$inc:
        {
            wallet:(3*x.lvl1depfin)-(x.lvl1depfin)
        }
    },{useFindAndModify:false})
    return upgraded;
}
else if(xxx === 10){
    await AdvanceL2(_id);
}
}

//Queue Operations
async function QueueOperations(referrerData,userid){
    if(referrerData.childIds.length>=2){
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
        //Enter the Queue Not necc
        // Code Later

        // Add user to the Parent
        await User.findByIdAndUpdate({_id:userid},{$set:{
            action:true,
            level:'silver',
            parentId:referrerData.parentId,
            transactions: {
            name:"Initial Deposit",
            type:"Deposit",
            amount:'+'+initialDeposit
        }}},{useFindAndModify:false},(errors,result)=>{
            if(errors){
                console.log(errors);
            }
            else{
                if(referrerData.parentId !== null){
                User.findByIdAndUpdate({_id:referrerData.parentId},{$push:{
                    childIds:{
                        userId:result._id
                    }
                }},{useFindAndModify:false},async (err,res)=>{
                    if(err){console.log(err)}
                    else{
                        if(res.stage === 1){
                            await User.findOneAndUpdate({_id:res._id},{
                                $push:{
                                transactions: {
                                    name:"Referral Joined",
                                    type:"Deposit",
                                    amount:'+'+refBonus
                                }
                            }
                            },{useFindAndModify:false})
                        }
                    }
                })
            }
        }
        }).then(res => {
            const message = "Congrats! Your wallet balance is updated with the deposit amount.";
            request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+res.number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
        })
    }

}

//Update ref balance
async function updateReff(_id){
    const adminData = await getAdminResult();
    var refBonus = (adminData.lvl1depfin)/2;
    await User.findOneAndUpdate({_id},{
        $push:{
            transactions: {
                name:"Referral Joined",
                type:"Deposit",
                amount:'+'+refBonus
            }
        }
    },{useFindAndModify:false});
}

async function getOneDet(_id){
    var hisDet = await User.findOne({_id});
    return hisDet;
}

// Level 2 Operations ------------------------
async function AdvanceL2(_id){
    var getUser = await User.findOneAndUpdate({_id},{
        $set:{stage:1,level:'gold'}
    },{useFindAndModify:false});
    var getUserStage = await getOneDet(_id);
    var ancestorProcess = await ancProcess(_id,getUserStage);
}

async function ancProcess(_id,user){
    var getParent = await User.findOne({_id});
    var parent = getParent.parentId;

    while(parent != null){ 
        var dets = await getOneDet(parent);
        if(dets.level === 'gold'){
            var userStage = await getOneDet(parent);
            if(userStage === user.stage){
                var upgradedId = await RemUpgrade(_id,user);
            }
        }
    }
}

//Remember upgrade
async function RemUpgrade(_id,user){
    var x = await getAdminResult();
    let refBonus = (x.lvl2depfin)/2;
    var dets = await getOneDet(_id);
    if(childUpgraded.length < 5){
        var addChild = await findOneAndUpdate({_id},{
            $push:{
                childUpgraded:{
                    userId:user._id
                },
                transactions: {
                    name:"Referral Joined",
                    type:"Deposit",
                    amount:'+'+refBonus
                }
            }
        },{useFindAndModify:false});
    }
    else if(childUpgraded.length === 5){
        var updateInfo = await User.findOneAndUpdate({_id},{$push:{
            childUpgraded:{
                userId:user._id
            },
            transactions: {
                name:"Referral Joined",
                type:"Deposit",
                amount:'+'+refBonus
            }
        }})
        //Upgrade parent
        let upgradeParentL2 = await upgradeParentL2(_id);
        // remember his ancestors too
        if( parentInfo.parentId !== null ){
                var stagOp = await ancProcess(_id,user);
        }
        // ********
        }
        else if(childUpgraded.length === 6){
        var updateInfo = await User.findOneAndUpdate({_id},{$set:{
            childUpgraded:{
                userId:user._id
            }
        },
        $push:{
            transactions: {
                name:"Referral Joined",
                type:"Deposit",
                amount:'+'+refBonus
            }
        }},
        )
        }
}

//upgrade level 2 parent
async function upgradeParentL2(_id){
    var x = await getAdminResult();
    var xxx = await getUserStage(_id);
    if(xxx < 6){
    var upgraded = await User.findOneAndUpdate({_id},{$inc:
        {
            stage:1,
            wallet:(3*x.lvl2depfin)-(x.lvl2depfin),
            "payout.eligible":(3*x.lvl2depfin)-(x.lvl2depfin)
        }
    },
    {
        $push:{
            transactions:[{   
                name:"Referral",
                type:"Deposit",
                amount:'+'+3*x.lvl2depfin
            },
            {          
                name:"Deposit",
                type:"Deposit",
                amount:'-'+x.lvl2depfin
            }]
        }
    }
    );
    const message = "Congrats! Your wallet balance is updated with +"+ 3*x.lvl2depfin +"Refferral funds.";
    request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+upgraded.number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
    if(upgraded.parentId !== 'null' || typeof upgraded !== 'undefined'){
        var res = await ancProcess(upgraded,upgraded);
    }
    return upgraded;
}else if(xxx<10){
    var upgraded = await User.findOneAndUpdate({_id},{$inc:
        {
            wallet:(3*x.lvl2depfin)-(x.lvl2depfin)
        }
    },{useFindAndModify:false})
    return upgraded;
}
else if(xxx === 10){
    await AdvanceL3(_id);
}
}

//Level 3 advance -------------------
async function AdvanceL3(_id){
    var getUser = await User.findOneAndUpdate({_id},{
        $set:{stage:1,level:'sapphire'}
    },{useFindAndModify:false});
    var getUserStage = await getOneDet(_id);
    var ancestorProcess = await ancProcessL3(_id,getUserStage);
}

async function ancProcessL3(_id,user){
    var getParent = await User.findOne({_id});
    var parent = getParent.parentId;

    while(parent != null){ 
        var dets = await getOneDet(parent);
        if(dets.level === 'sapphire'){
            var userStage = await getOneDet(parent);
            if(userStage === user.stage){
                var upgradedId = await RemUpgradeL3(_id,user);
            }
        }
    }
}

//Remember upgrade
async function RemUpgradeL3(_id,user){
    var x = await getAdminResult();
    let refBonus = (x.lvl3depfin)/2;
    var dets = await getOneDet(_id);
    if(childUpgraded.length < 5){
        var addChild = await findOneAndUpdate({_id},{
            $push:{
                childUpgraded:{
                    userId:user._id
                },
                transactions: {
                    name:"Referral Joined",
                    type:"Deposit",
                    amount:'+'+refBonus
                }
            }
        },{useFindAndModify:false});
    }
    else if(childUpgraded.length === 5){
        var updateInfo = await User.findOneAndUpdate({_id},{$push:{
            childUpgraded:{
                userId:user._id
            },
            transactions: {
                name:"Referral Joined",
                type:"Deposit",
                amount:'+'+refBonus
            }
        }})
        //Upgrade parent
        let upgradeParentL2 = await upgradeParentL3(_id);
        // remember his ancestors too
        if( parentInfo.parentId !== null ){
                var stagOp = await ancProcessL3(_id,user);
        }
        // ********
        }
        else if(childUpgraded.length === 6){
        var updateInfo = await User.findOneAndUpdate({_id},{$set:{
            childUpgraded:{
                userId:user._id
            }
        },
        $push:{
            transactions: {
                name:"Referral Joined",
                type:"Deposit",
                amount:'+'+refBonus
            }
        }},
        )
        }
}

//upgrade level 2 parent
async function upgradeParentL3(_id){
    var x = await getAdminResult();
    var xxx = await getUserStage(_id);
    if(xxx < 6){
    var upgraded = await User.findOneAndUpdate({_id},{$inc:
        {
            stage:1,
            wallet:(3*x.lvl3depfin)-(x.lvl3depfin),
            "payout.eligible":(3*x.lvl3depfin)-(x.lvl3depfin)
        }
    },
    {
        $push:{
            transactions:[{   
                name:"Referral",
                type:"Deposit",
                amount:'+'+3*x.lvl3depfin
            },
            {          
                name:"Deposit",
                type:"Deposit",
                amount:'-'+x.lvl3depfin
            }]
        }
    }
    );
    const message = "Congrats! Your wallet balance is updated with +"+ 3*x.lvl3depfin +"Refferral funds.";
    request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+upgraded.number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
    if(upgraded.parentId !== 'null' || typeof upgraded !== 'undefined'){
        var res = await ancProcessL3(upgraded,upgraded);
    }
    return upgraded;
}
}





setTimeout( () => {
    // reset();
},3000)

async function reset(){
    User.updateMany({},{
        $set:{
            action:false,
            childIds:[],
            transactions:[],
            wallet:0,
            childUpgraded:[],
            stage:1,
            'payout.eligible':0
        }
    },(err,res) => {
        if(err)console.log(err);
    })
}


//Check details of children of refferrer


module.exports = router;

