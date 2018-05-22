const User = require('../models/user');
const PersonsUser = require('../models/personsuser');

module.exports.getUserByToken = async function(token) {
    const {_id} = token;
    let user;
    try{
        user = await User.findOne({_id}, {password: 0});
        console.log(user);
    }catch(e)
    {
        throw e;
    }
    return user;
}
module.exports.findAll = async function(token) {
    let user;
    try{
        user = await User.find({});
    }catch(e)
    {
        throw e;
    }
    return user;
}
module.exports.getUserByLogin = async function(login) {
    let user;
    try{
        user = await User.findOne({_id}, {password: 0});
        console.log(user);
    }catch(e)
    {
        throw e;
    }
    return user;
}
module.exports.changeSkin = async function(token, skin) {
    const {_id} = token;
    let user;
    try{
        user = await User.findOne({_id}, {password: 0});
        await User.update({_id}, {$set: {currectPerson : skin}})
    }catch(e)
    {
        throw e;
    }
    return  {message:'You skin was changed', coins: user.coins};
}

module.exports.setUserByToken = async function(token, coins, p_id) {
    const {_id} = token;
    let user;
    try{
        user = await User.findOne({_id}, {coins: 1}); 
        if(user.coins >= coins)
        {
            user.coins -=coins;
            await User.updateOne({_id}, {$set: {coins : user.coins}});
            user = await User.findOne({_id}, {coins: 1});  
            await PersonsUser.insertMany([{user_id: _id, person_id: p_id, level: 0}]);
        }   
        else{
            return {message:'You did not have enough coins', coins: user.coins}
        }  
    }catch(e)
    {
        throw e;
    }

    return {message:'', coins: user.coins};
}
