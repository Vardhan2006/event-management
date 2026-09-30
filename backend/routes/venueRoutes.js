const express = require("express");
const router = express.Router();

const {
  createVenue,
  getVenues,
  getVenuesMeta,
  getOwnerVenues,
  getVenueById,
  getVenueAvailability,
  updateVenue,
  deleteVenue,
} = require("../controllers/venueController");

const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const {
  createVenueSchema,
  updateVenueSchema,
  availabilityQuerySchema,
  searchQuerySchema,
} = require("../validators/venueValidators");
const { idParamSchema } = require("../validators/commonValidators");

// Public list with search, filter, sort, pagination
router.get("/", validate({ query: searchQuerySchema }), getVenues);

// Public metadata for filters (MUST be defined before GET /:id)
router.get("/meta", getVenuesMeta);

// Owner list (MUST be defined before GET /:id)
router.get("/mine", protect, authorize("owner"), getOwnerVenues);

// Public availability endpoint (MUST be defined before GET /:id)
router.get(
  "/:id/availability",
  validate({ query: availabilityQuerySchema }),
  getVenueAvailability
);

// Public single item with owner populated
router.get("/:id", getVenueById);

// Owner management routes
router.post(
  "/",
  protect,
  authorize("owner"),
  upload.array("images", 5),
  validate({ body: createVenueSchema }),
  createVenue
);

router.patch(
  "/:id",
  protect,
  authorize("owner"),
  upload.array("images", 5),
  validate({ body: updateVenueSchema }),
  updateVenue
);

router.delete(
  "/:id",
  protect,
  authorize("owner"),
  deleteVenue
);

module.exports = router;