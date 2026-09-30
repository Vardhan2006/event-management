const express = require("express");
const router = express.Router();

const { getOwnerStats } = require("../controllers/ownerController");
const { protect, authorize } = require("../middleware/auth");

router.get("/stats", protect, authorize("owner"), getOwnerStats);

module.exports = router;
