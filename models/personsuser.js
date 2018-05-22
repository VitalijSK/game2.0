const mongoose = require('mongoose');

const PersonsUserSchema = new mongoose.Schema({
    user_id : String,
    person_id : String,
    level : {
        type:Number,
        default: 0
    },
    exp : {
        type:Number,
        default: 0
    },
    limit : {
        type:Number,
        default: 50
    }
});

module.exports = mongoose.model('PersonsUser', PersonsUserSchema);