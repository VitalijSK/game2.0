const mongoose = require('mongoose');

const PersonsUserSchema = new mongoose.Schema({
    user_id : String,
    person_id : String,
    level : Number,
});

module.exports = mongoose.model('PersonsUser', PersonsUserSchema);