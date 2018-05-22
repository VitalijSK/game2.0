const UserService = require('../services/UserService');
const Persons = require('../services/Persons');
const PersonsUser = require('../services/PersonsUser');

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
module.exports.getTop = async function(req, res, next){
    let persons;
    let users = [];
    let login, cur;
    let user, person;
    try{
        persons = await PersonsUser.findTop();
        user = await UserService.findAll();
        person = await Persons.findAll();
        for(let i = 0, n = persons.length; i < n; i++){
            for (let us in user) {
                if(user[us]._id == persons[i].user_id){
                    login =user[us].login;
                }
              }
              for (let per in person) {
                if(person[per]._id == persons[i].person_id){
                    cur = person[per].title;
                }
              }
            users.push({name: login , person: cur, level: persons[i].level});
        }
    }catch({message}){
        return next({
            status: 500,
            message
        });
    }
    return res.json(users);
};