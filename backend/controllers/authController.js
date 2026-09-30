const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { signToken } = require("../utils/token");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.validated?.body || req.body;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ApiError(409, "EMAIL_TAKEN", "Email already in use");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: role || "user",
  });

  const token = signToken({ id: user._id, role: user.role });

  res.status(201).json({
    token,
    user,
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated?.body || req.body;

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

  if (!user) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const token = signToken({ id: user._id, role: user.role });

  // Exclude passwordHash from user object in response
  const userJson = user.toJSON();

  res.json({
    token,
    user: userJson,
  });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({
    user: req.user,
  });
});
