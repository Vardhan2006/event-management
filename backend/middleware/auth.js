const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { verifyToken } = require("../utils/token");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required");
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "UNAUTHORIZED", "User no longer exists");
  }

  req.user = user;
  next();
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          "FORBIDDEN",
          "You do not have permission to perform this action"
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
