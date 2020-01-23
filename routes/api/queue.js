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

setTimeout(() => {
    // countUsers('5e1d4cb53dddf2032c8e15fe');
}, 3000);

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
    console.log(getAncestorId);
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
        console.log(isChildSameStage);
        console.log(finalEles)
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
            var checkUpgrade = await doStageOperation(updateUser)
            const message = "Congrats! Your wallet balance is updated with +"+ 3*x.lvl1depfin +"Refferral funds.";
            request('http://manage.ibulksms.in/api/sendhttp.php?authkey=14403A2ZQif2h5de7a91d&mobiles='+updateUser.number+'&message='+message+'&sender=FORVIS&route=4&country=91&response=json')
            console.log(updateUser)
        }
        else if(!isChildSameStage){
            console.log("Not")
        }
        else{
            console.log(finalEles.length)
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
async function doStageOperation(user){
    var _id = user._id;
    var x = await getAdminResult();
    let refBonus = (x.lvl1depfin)/2;
    console.log(_id)
    var userInfo = await User.findOne({_id});
    var userParent = userInfo.parentId;
    console.log(userParent)
    if(userParent !== null){
        console.log('hello')
        var parentInfo = await User.findOne({_id:userParent});
        var getChildUpgraded = parentInfo.childUpgraded;
        console.log(getChildUpgraded.length);
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
        console.log(upgradeParentx);
        }
        else if(getChildUpgraded.length === 6){
        var updateInfo = await User.findOneAndUpdate({_id:userParent},{$set:{
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
    }
    return;
}

//upgrade parent
async function upgradeParent(_id){
    console.log(_id)
    var x = await getAdminResult();
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
        var res = await doStageOperation(upgraded.parentId);
        console.log(res);
    }
    return upgraded;
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


//Check details of children of refferrer


module.exports = router;

