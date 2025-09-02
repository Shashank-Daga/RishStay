const mongoose = require('mongoose');
const { Schema } = mongoose;

const PropertySchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },

  location: {
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
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
  images: [{ type: String, default: [] }],

  bedrooms: { type: Number, required: true, min: 0 },
  bathrooms: { type: Number, required: true, min: 0 }, // can be float (e.g., 1.5)
  area: { type: Number, required: true },

  maxGuests: { type: Number, required: true, min: 1 },
  guestType: {
    type: String,
    enum: ["Family", "Bachelors", "Girls", "Boys"],
    required: true,
  },

  landlord: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  availability: {
    isAvailable: { type: Boolean, default: true },
    availableFrom: { type: Date },
    availableTo: { type: Date },
  },

  rules: { type: [String], default: [] },
}, {
  timestamps: true
});

// Indexes for better query performance
PropertySchema.index({ "location.city": 1, "location.state": 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ propertyType: 1 });

const Property = mongoose.model("property", PropertySchema);
module.exports = Property;
