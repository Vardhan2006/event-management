const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  venueId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Venue",
    required: true,
    index: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    default: "",
    trim: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending",
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Partial unique index ensuring a venue can only have ONE approved booking per date
BookingSchema.index(
  { venueId: 1, eventDate: 1 },
  { unique: true, partialFilterExpression: { status: "approved" } }
);

module.exports = mongoose.model("Booking", BookingSchema);
