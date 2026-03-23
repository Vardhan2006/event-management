const express = require("express");
const router = express.Router();

// ✅ Import controller
const {
  createVenue,
  getVenues,
  getVenueById,
  updateVenue,
  deleteVenue
} = require("../controllers/venueController");

// ✅ Import upload middleware
const upload = require("../middleware/upload");

// 🔥 POST with image upload
router.post("/", upload.array("images", 5), createVenue);

router.get("/", getVenues);

router.patch("/:id", upload.array("images", 5), updateVenue);
router.delete("/:id", deleteVenue);

router.get("/:id", getVenueById);

module.exports = router;