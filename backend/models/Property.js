const mongoose = require('mongoose');
const { Schema } = mongoose;

const PropertySchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },

  location: {
    address: { type: String, required: true, index: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    _id: false,
  },

  propertyType: {
    type: String,
    enum: ["apartment", "studio"],
    required: true,
  },

  amenities: [{ type: String, default: [] }],
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
    }
  ],

  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 },
  area: { type: Number, required: true },

  maxGuests: { type: Number, required: true, min: 1 },
  guestType: {
    type: String,
    enum: ["Family", "Bachelors", "Girls", "Boys"],
    required: true,
  },

  landlord: {
    type: Schema.Types.ObjectId,
    ref: "User",   // ✅ must match your User model
    required: true,
  },

  availability: {
    isAvailable: { type: Boolean, default: true },
    availableFrom: { type: Date },
    availableTo: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || !this.availability.availableFrom || v > this.availability.availableFrom;
        },
        message: "availableTo must be after availableFrom"
      }
    },
  },

  rules: { type: [String], default: [] },
  rooms: [
    {
      roomName: { type: String, required: true },
      rent: { type: Number, required: true, min: 0 },
      size: { type: Number, required: true, min: 0 },
      amenities: [{ type: String, default: [] }],
      status: { type: String, enum: ["available", "booked"], default: "available" },
      description: { type: String, default: "" },
      _id: false,
    }
  ],
}, {
  timestamps: true
});

// Indexes for better query performance
PropertySchema.index({ "location.address": 1, price: 1, availability: 1 });

const Property = mongoose.model("Property", PropertySchema);
module.exports = Property;
