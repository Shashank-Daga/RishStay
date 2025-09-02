const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    inquiryType: {
        type: String,
        enum: ['general', 'viewing', 'application', 'availability'],
        default: 'general'
    },
    preferredDate: {
        type: Date
    },
    phone: {
        type: String
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'replied'],
        default: 'unread'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Message', MessageSchema);
