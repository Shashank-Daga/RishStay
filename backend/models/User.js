const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phoneNo:{
        type: String,
        required: true,
        match: /^[0-9]{10}$/,                       // This ensures that the phone number is exactly 10 digits
        message: 'Enter a valid phone number'
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const User = mongoose.model('user', UserSchema);
//   User.createIndexes();

module.exports = User;
