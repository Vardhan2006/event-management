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
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running...");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/venues", require("./routes/venueRoutes"));

// Catch 404 for unknown routes
app.use((req, res, next) => {
  next(new ApiError(404, "NOT_FOUND", "Route not found"));
});

// Central error handler
app.use(errorHandler);

module.exports = app;
