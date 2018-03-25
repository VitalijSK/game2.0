const mongoose = require('mongoose');
const bcrypt = require('bcrypt-as-promised');

const UserSchema = new mongoose.Schema({
    login : {
        type: String,
        lowercase: true,
        index: true,
        unique: true
    },
    password: String
});

UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);

    this.password = hash;
    next();
});

UserSchema.methods.comparePasswords = function(password)
{
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);