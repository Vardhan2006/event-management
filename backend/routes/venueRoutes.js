const express = require("express");
const router = express.Router();

// ✅ Import controller
const {
  createVenue,
  getVenues,
  getVenueById
} = require("../controllers/venueController");

// ✅ Import upload middleware
const upload = require("../middleware/upload");

// 🔥 POST with image upload
router.post("/", upload.array("images", 5), createVenue);

// GET all venues
router.get("/", getVenues);

// GET single venue
router.get("/:id", getVenueById);

module.exports = router;