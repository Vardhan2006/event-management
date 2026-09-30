const mongoose = require("mongoose");
const Venue = require("../models/Venue");
const Booking = require("../models/Booking");
const asyncHandler = require("../utils/asyncHandler");

exports.getOwnerStats = asyncHandler(async (req, res) => {
  const ownerId = req.user._id || req.user.id;
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const venueCount = await Venue.countDocuments({ ownerId });

  const bookingStats = await Booking.aggregate([
    {
      $match: { ownerId: ownerObjectId },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    cancelled: 0,
  };

  let total = 0;
  bookingStats.forEach((item) => {
    if (item._id && counts[item._id] !== undefined) {
      counts[item._id] = item.count;
    }
    total += item.count;
  });

  res.json({
    venues: venueCount,
    bookings: {
      pending: counts.pending,
      approved: counts.approved,
      rejected: counts.rejected,
      cancelled: counts.cancelled,
      total,
    },
  });
});
