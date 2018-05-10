const PersonsUser = require('../models/personsuser');

module.exports.find = async function(condit) {
    let persons;
    try{    
        persons = await PersonsUser.find(condit, {'user_id':false});
    }catch(e)
    {
        throw e;
    }
    return persons;
}
module.exports.findAll = async function(condit) {
    let persons;
    try{    
        persons = await PersonsUser.find({});
    }catch(e)
    {
        throw e;
    }
    return persons;
}