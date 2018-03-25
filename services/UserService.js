const User = require('../models/user');

module.exports.getUserByToken = async function(token) {
    const {_id} = token;
    let user;
    try{
        user = await User.findOne({_id}, {password: 0});
    }catch(e)
    {
        throw e;
    }

    return user;
}