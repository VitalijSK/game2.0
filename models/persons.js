const mongoose = require('mongoose');
const bcrypt = require('bcrypt-as-promised');

const PersonSchema = new mongoose.Schema({
    title : {
        type: String,
        lowercase: true,
        index: true,
        unique: true
    },
    characteristics: Object,
    buy:  { 
        type: Boolean,
        default: false 
        },
    src:  { 
            type: String,
            default: 'knight.png' 
            },
    chose: { 
        type: Boolean,
        default: false 
        },
    price: { 
        type: Number,
        default: 0 
        }
});

module.exports = mongoose.model('Persons', PersonSchema);