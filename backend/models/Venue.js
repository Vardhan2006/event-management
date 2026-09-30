const mongoose = require("mongoose");

const VenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  location: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },

  capacity: {
    type: Number,
    required: true,
    min: 0,
  },

  pricePerDay: {
    type: Number,
    required: true,
    min: 0,
    index: true,
  },

  description: {
    type: String,
    required: true,
  },

  services: {
    type: [String],
    default: [],
  },

  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  images: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model("Venue", VenueSchema);
