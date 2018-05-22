const Persons = require('../models/persons');

module.exports.add = async function(property) {
    try{    
        await Persons.insert(property);
    }catch(e)
    {
        throw e;
    }
}
module.exports.findAll = async function() {
    let persons;
    try{    
        persons = await Persons.find({});
    }catch(e)
    {
        throw e;
    }
    return persons;
}
module.exports.find = async function(condit) {
    let person;
    try{    
        
        person = await Persons.findOne(condit, {'price':true});
    }catch(e)
    {
        throw e;
    }
    return person;
}