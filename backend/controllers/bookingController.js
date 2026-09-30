const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Venue = require("../models/Venue");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { parseDateOnly, isPast } = require("../utils/dates");
const { isDateAvailable } = require("../services/availability");

exports.createBooking = asyncHandler(async (req, res) => {
  const { venueId, eventDate, title, notes } = req.validated?.body || req.body;

  if (!mongoose.Types.ObjectId.isValid(venueId)) {
    throw new ApiError(400, "INVALID_ID", "Invalid venue ID format");
  }

  const parsedDate = parseDateOnly(eventDate);
  if (!parsedDate) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Invalid calendar date format (YYYY-MM-DD)"
    );
  }

  if (isPast(parsedDate)) {
    throw new ApiError(400, "PAST_DATE", "Event date cannot be in the past");
  }

  const venue = await Venue.findById(venueId);
  if (!venue) {
    throw new ApiError(404, "NOT_FOUND", "Venue not found");
  }

  // Check if date is already approved for that venue
  const available = await isDateAvailable(venueId, parsedDate);
  if (!available) {
    throw new ApiError(
      409,
      "DATE_UNAVAILABLE",
      "Venue is already booked for this date"
    );
  }

  // Check if user already has a pending request for the same venue + date
  const userId = req.user._id || req.user.id;
  const duplicatePending = await Booking.findOne({
    venueId,
    eventDate: parsedDate,
    userId,
    status: "pending",
  });
  if (duplicatePending) {
    throw new ApiError(
      409,
      "DUPLICATE_REQUEST",
      "You already have a pending booking request for this venue and date"
    );
  }

  const booking = await Booking.create({
    userId,
    venueId: venue._id,
    ownerId: venue.ownerId,
    title,
    notes: notes || "",
    eventDate: parsedDate,
    totalPrice: venue.pricePerDay,
    status: "pending",
    venueSnapshot: {
      name: venue.name,
      location: venue.location,
    },
  });

  res.status(201).json(booking);
});

const formatBooking = (b) => {
  const doc = b.toObject ? b.toObject() : { ...b };
  if (!doc.venueId || typeof doc.venueId !== "object" || !doc.venueId.name) {
    doc.venueId = {
      _id: doc.venueId ? String(doc.venueId._id || doc.venueId) : null,
      name: doc.venueSnapshot?.name || "Deleted Venue",
      location: doc.venueSnapshot?.location || "N/A",
    };
  }
  return doc;
};

exports.getUserBookings = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const filter = { userId };

  if (req.validated?.query?.status) {
    filter.status = req.validated.query.status;
  }

  const bookings = await Booking.find(filter)
    .populate("venueId", "name location")
    .sort({ createdAt: -1 });

  res.json(bookings.map(formatBooking));
});

exports.getOwnerBookings = asyncHandler(async (req, res) => {
  const ownerId = req.user._id || req.user.id;
  const filter = { ownerId };

  if (req.validated?.query?.status) {
    filter.status = req.validated.query.status;
  }

  if (req.validated?.query?.venueId) {
    filter.venueId = req.validated.query.venueId;
  }

  const bookings = await Booking.find(filter)
    .populate("venueId", "name location")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.json(bookings.map(formatBooking));
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "INVALID_ID", "Invalid booking ID format");
  }

  const booking = await Booking.findById(id)
    .populate("venueId", "name location")
    .populate("userId", "name email");

  if (!booking) {
    throw new ApiError(404, "NOT_FOUND", "Booking not found");
  }

  const callerId = String(req.user._id || req.user.id);
  const bookerId = String(booking.userId._id || booking.userId);
  const ownerId = String(booking.ownerId);

  if (callerId !== bookerId && callerId !== ownerId) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You do not have permission to view this booking"
    );
  }

  res.json(formatBooking(booking));
});

exports.reviewBookingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status: newStatus } = req.validated?.body || req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "INVALID_ID", "Invalid booking ID format");
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new ApiError(404, "NOT_FOUND", "Booking not found");
  }

  const callerId = req.user._id || req.user.id;
  if (String(booking.ownerId) !== String(callerId)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You do not have permission to manage this booking"
    );
  }

  if (booking.status !== "pending") {
    throw new ApiError(
      409,
      "INVALID_TRANSITION",
      "Only pending bookings can be reviewed"
    );
  }

  if (newStatus === "approved") {
    booking.status = "approved";
    try {
      await booking.save();
    } catch (err) {
      if (err.code === 11000 || (err.message && err.message.includes("E11000"))) {
        throw new ApiError(
          409,
          "DATE_ALREADY_BOOKED",
          "This date has already been booked by another request"
        );
      }
      throw err;
    }

    // Auto-reject all other pending requests for the same venue + date
    await Booking.updateMany(
      {
        venueId: booking.venueId,
        eventDate: booking.eventDate,
        status: "pending",
        _id: { $ne: booking._id },
      },
      { status: "rejected" }
    );
  } else if (newStatus === "rejected") {
    booking.status = "rejected";
    await booking.save();
  }

  res.json(booking);
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "INVALID_ID", "Invalid booking ID format");
  }

  const booking = await Booking.findById(id);
  if (!booking) {
    throw new ApiError(404, "NOT_FOUND", "Booking not found");
  }

  const callerId = req.user._id || req.user.id;
  if (String(booking.userId) !== String(callerId)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You do not have permission to cancel this booking"
    );
  }

  if (booking.status !== "pending" && booking.status !== "approved") {
    throw new ApiError(
      409,
      "INVALID_TRANSITION",
      "Booking cannot be cancelled"
    );
  }

  booking.status = "cancelled";
  await booking.save();

  res.json(booking);
});
