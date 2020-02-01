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
    var doQueueOperations = await QueueOperation(_id);
    var useris = await getUserDetails(_id)
    var initialProcess = await addInitialVal(_id,useris.referrer);
    response.send(initialProcess);
});


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

//Queue Operations
async function QueueOperation(_id){
    //get first direct parent if any
    var getParent = await getReferrer(_id);
    if(getParent !== null && getParent.parentId !== null){
        var checkForUpgrade = upgrade(getParent.parentId);
        return checkForUpgrade
    }
}

async function upgrade(_id){
    //Get all descendants
    var parentInfo = await getUserDetails(_id);
    if(parentInfo.childIds.length === 2 && parentInfo.stage === 1){
        var childrenLength1 = await getChildrenLen(parentInfo.childIds[0].userId);
        var childrenLength2 = await getChildrenLen(parentInfo.childIds[1].userId);
        console.log((childrenLength1 + childrenLength2));
        if((childrenLength1 + childrenLength2) === 3){
            var stageUpgrade = await upgradeStage(_id);
            return stageUpgrade;
        }
    }
}

//Get children len
async function getChildrenLen(_id){
    var childs = await getUserDetails(_id);
    return childs.childIds.length;
}

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