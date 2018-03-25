const UserService = require('../services/UserService');

module.exports.getCurrentUser = async function(req, res, next){
    const {token} = req;
    let user;
    try{
        user = await UserService.getUserByToken(token);
    }catch({message}){
        return next({
            status: 500,
            message
        });
    }
    return res.json(user);
};