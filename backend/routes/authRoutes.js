const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login, me } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");
const validate = require("../middleware/validate");
const { registerSchema, loginSchema } = require("../validators/authValidators");

const router = express.Router();

// Rate limiting for auth endpoints (no-op during automated testing)
const authLimiter =
  process.env.NODE_ENV === "test"
    ? (req, res, next) => next()
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // 10 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "Too many authentication attempts. Please try again later.",
          },
        },
      });

router.use(authLimiter);

router.post("/register", validate({ body: registerSchema }), register);
router.post("/login", validate({ body: loginSchema }), login);
router.get("/me", protect, me);

// Test route for authorize middleware (only active in test environment)
if (process.env.NODE_ENV === "test") {
  router.get("/test-owner-only", protect, authorize("owner"), (req, res) => {
    res.json({ message: "Owner access granted" });
  });
}

module.exports = router;
