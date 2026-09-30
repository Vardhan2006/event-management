const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, ".env") });

const ApiError = require("./utils/ApiError");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

const clientOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || clientOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new ApiError(403, "CORS_ERROR", "Not allowed by CORS"));
    },
    allowedHeaders: ["Authorization", "Content-Type"],
    exposedHeaders: ["X-Total-Count", "X-Page", "X-Limit", "X-Total-Pages"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/venues", require("./routes/venueRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/owner", require("./routes/ownerRoutes"));

// Catch 404 for unknown routes
app.use((req, res, next) => {
  next(new ApiError(404, "NOT_FOUND", "Route not found"));
});

// Central error handler
app.use(errorHandler);

module.exports = app;
