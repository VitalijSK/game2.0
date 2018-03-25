const jwt = require('jsonwebtoken');
const config = require('../config/index');
module.exports = async (req, res, next)=>{
    const token = req.headers['authorization'];
    
    if(!token){
        return next({
            status: 403,
            message: 'Forbidden. no Token!'
        });
    }
    let tokenObj;
    try{
        tokenObj = jwt.verify(token, config.secret);
    }catch({message})
    {
        return next({
            status: 400,
            message
        });
    }

    req.token = tokenObj;
    next();
};