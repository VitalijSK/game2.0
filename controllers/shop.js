const UserService = require('../services/UserService');
const Persons = require('../services/Persons');
const PersonsUser = require('../services/PersonsUser');

module.exports.buy = async function(req, res, next){
    const {token, good} = req;
    let {_id, coins} = await UserService.getUserByToken(token);
    let change = false;
    const personsUser = await PersonsUser.find({user_id: _id});
    let person = await Persons.find({title: good});
    personsUser.forEach((personUser)=>{
        if(person._id == personUser.person_id)
        {
            change = true;
        }
    });
    let user;
    let answer = {message: '', coins: coins};
    try{
        if(!change)
        {
            answer = await UserService.setUserByToken(token, person.price, person._id);
        }    
         if(answer.message === '')
         {
            answer = await UserService.changeSkin(token, good);
         }       
    }catch({message}){
        return next({
            status: 500,
            message
        });
    }
    return res.json(answer);
};
module.exports.collection = async function(req, res, next){
    
    const {token} = req;
    let user;
    let persons;
    try{
        const {_id, currectPerson} = await UserService.getUserByToken(token);
        const personsUser = await PersonsUser.find({user_id: _id});
        persons = await Persons.findAll();
      
        persons.forEach((person)=>{
            if(currectPerson == person.title)
            {
                person.chose = true;
                person.buy = true;
            }
            personsUser.forEach((personUser)=>{
                if(person._id == personUser.person_id)
                {
                    person.buy = true;
                }
            });
        });
       
    }catch({message}){
        return next({
            status: 500,
            message
        });
    }

    return res.json(persons);
};