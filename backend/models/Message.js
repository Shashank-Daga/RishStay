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
        required: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        maxlength: 2000
    },
    inquiryType: {
        type: String,
        enum: ['general', 'viewing', 'application', 'availability'],
        default: 'general'
    },
    preferredDate: {
        type: Date,
        validate: {
            validator: function (v) {
                return !v || v > new Date();
            },
            message: props => `Preferred date must be in the future!`
        }
    },
    phone: {
        type: String,
        match: [/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'],
        required: false,
        trim: true
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'replied'],
        default: 'unread'
    }
}, {
    timestamps: true
});

// Indexes for performance
MessageSchema.index({ recipient: 1, property: 1, status: 1 });

module.exports = mongoose.model('Message', MessageSchema);
