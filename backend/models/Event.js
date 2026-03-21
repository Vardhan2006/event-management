const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  // Venue being booked
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  eventDate: {
    type: Date,
    required: true
  },

  // Clerk user id of the requester
  userId: {
    type: String,
    required: true,
    index: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Event", EventSchema);