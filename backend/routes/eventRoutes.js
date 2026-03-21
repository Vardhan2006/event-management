const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEvents,
  getUserBookings,
  getOwnerBookings,
  reviewEventBooking
} = require("../controllers/eventController");

router.get("/", getEvents);
router.post("/", createEvent);
router.get("/user", getUserBookings);
router.get("/owner", getOwnerBookings);
router.patch("/:id", reviewEventBooking);

module.exports = router;