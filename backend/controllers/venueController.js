const Venue = require("../models/Venue");

exports.createVenue = async (req, res) => {
  try {
    const {
      name,
      location,
      capacity,
      pricePerDay,
      description,
      services,
      ownerId
    } = req.body;

    const venue = new Venue({
      name,
      location,
      capacity,
      pricePerDay,
      description,
      services,
      ownerId
    });

    const savedVenue = await venue.save();

    res.status(201).json(savedVenue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });

    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};