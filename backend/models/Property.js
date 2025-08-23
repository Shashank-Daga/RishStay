const mongoose = require('mongoose');
const { Schema } = mongoose;

const PropertySchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    location: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        }
    },
    propertyType: {
        type: String,
        enum: ['apartment', 'house', 'villa', 'condo', 'studio'],
        required: true
    },
    amenities: [{
        type: String,
        default: []
    }],
    images: [{
        type: String,
        default: []
    }],
    bedrooms: {
        type: Number,
        required: true,
        min: 0
    },
    bathrooms: {
        type: Number,
        required: true,
        min: 0
    },
    area: {
        type: Number,
        required: true
    },
    maxGuests: {
        type: Number,
        required: true,
        min: 1
    },
    guestType: {
        type: String,
        enum: ['Family', 'Bachelors', 'Girls', 'Boys'],
        default: null
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    rules: [{
        type: String,
        default: []
    }],
    checkInTime: {
        type: String,
        default: '15:00'
    },
    checkOutTime: {
        type: String,
        default: '11:00'
    }
}, {
    timestamps: true            // Automatically adds createdAt and updatedAt
});

const Property = mongoose.model('property', PropertySchema);

module.exports = Property;
