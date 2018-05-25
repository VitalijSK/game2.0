const User = require('../models/user');
const Person = require('../models/persons');
const PersonUser = require('../models/personsuser');
const jwt = require('jsonwebtoken');
const config = require('../config/index');

module.exports.signup = async (req, res, next)=>{
    const credentials = req.body;
    let user;
    try{
        user = await  User.create(credentials);
        const person = await Person.findOne({title: user.currectPerson});
        await PersonUser.insertMany([{user_id: user._id, person_id: person._id, level: 0}]);
    }catch({message}){
        return next({
            status:400,
            message
        });
    }
    res.json(user);
}

module.exports.signin = async (req, res, next)=>{
    const { login, password }= req.body;

    const user = await User.findOne({login});

    if(!user)
    {
        return next({
            status:400,
            message: 'User not found'
        });
    }

    try {
        const result = await user.comparePasswords(password);
    } catch (e) {
        return next({
            status:400,
            message: 'Bad Credintials'
        });
    }

    req.session.userId = user._id;
    const token = jwt.sign({_id:user._id}, config.secret);
    res.json(token);
}


