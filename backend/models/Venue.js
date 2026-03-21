const mongoose = require("mongoose");

const VenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  location: {
    type: String,
    required: true,
    trim: true
  },

  capacity: {
    type: Number,
    required: true,
    min: 0
  },

  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },

  description: {
    type: String,
    required: true
  },

  // Example: ["catering", "decoration"]
  services: {
    type: [String],
    default: []
  },

  // Clerk user id of the venue owner
  ownerId: {
    type: String,
    required: true,
    index: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  images: [
    {
      type: String
    }
  ],
});

module.exports = mongoose.model("Venue", VenueSchema);

