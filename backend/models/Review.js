const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true,
        maxlength: 1000,
        trim: true
    },
    userName: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        enum: ['landlord', 'tenant'],
        required: true
    }
}, {
    timestamps: true
});

// Indexes for better query performance
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ userId: 1 }); // Ensure one review per user

module.exports = mongoose.model('Review', ReviewSchema);
