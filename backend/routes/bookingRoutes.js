const express = require("express");
const router = express.Router();

const {
  createBooking,
  getUserBookings,
  getOwnerBookings,
  getBookingById,
  reviewBookingStatus,
  cancelBooking,
} = require("../controllers/bookingController");

const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  createBookingSchema,
  updateStatusSchema,
  queryFilterSchema,
} = require("../validators/bookingValidators");

// User booking creation
router.post(
  "/",
  protect,
  authorize("user"),
  validate({ body: createBookingSchema }),
  createBooking
);

// User bookings list
router.get("/mine", protect, validate({ query: queryFilterSchema }), getUserBookings);

// Owner bookings list
router.get(
  "/owner",
  protect,
  authorize("owner"),
  validate({ query: queryFilterSchema }),
  getOwnerBookings
);

// Single booking by ID (MUST be defined after /mine and /owner)
router.get("/:id", protect, getBookingById);

// Owner review (approve / reject)
router.patch(
  "/:id/status",
  protect,
  authorize("owner"),
  validate({ body: updateStatusSchema }),
  reviewBookingStatus
);

// User cancellation
router.patch("/:id/cancel", protect, cancelBooking);

module.exports = router;
