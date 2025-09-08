const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phoneNo: {
        type: String,
        required: true,
        unique: true,
        match: [/^[0-9]{10}$/, 'Enter a valid 10-digit phone number']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Enter a valid email address']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['landlord', 'tenant'],
        required: true
    },
    favorites: {
        type: [Schema.Types.ObjectId], // Array of Property IDs
        ref: 'Property',
        default: []
    }
}, {
    timestamps: true // adds createdAt, updatedAt automatically
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
