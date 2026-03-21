const Event = require("../models/Event");
const Venue = require("../models/Venue");

exports.createEvent = async (req, res) => {
  try {
    const { venueId, title, description, eventDate, userId } = req.body;

    const newEvent = new Event({
      venueId,
      title,
      description,
      eventDate,
      userId,
      status: "pending"
    });

    const savedEvent = await newEvent.save();

    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate("venueId")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function getUserIdFromRequest(req) {
  return (
    req.query.userId ||
    req.query.ownerId || // for convenience
    req.headers["x-user-id"] ||
    req.headers["x-owner-id"]
  );
}

exports.getUserBookings = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const bookings = await Event.find({ userId })
      .populate("venueId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOwnerBookings = async (req, res) => {
  try {
    const ownerId = getUserIdFromRequest(req);
    if (!ownerId) {
      return res.status(400).json({ message: "ownerId is required" });
    }

    const venues = await Venue.find({ ownerId }).select("_id");
    const venueIds = venues.map((v) => v._id);

    const bookings = await Event.find({ venueId: { $in: venueIds } })
      .populate("venueId")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reviewEventBooking = async (req, res) => {
  try {
    const { status } = req.body;
    const bookingId = req.params.id;
    const actorId = getUserIdFromRequest(req);

    const allowed = ["pending", "approved", "rejected"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Event.findById(bookingId).populate("venueId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Optional authorization check for owners.
    // If actorId is provided, ensure they own the venue.
    if (actorId && booking?.venueId?.ownerId) {
      if (String(booking.venueId.ownerId) !== String(actorId)) {
        return res.status(403).json({ message: "Not authorized" });
      }
    }

    booking.status = status;
    const updated = await booking.save();

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};