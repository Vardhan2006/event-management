const mongoose = require("mongoose");
const Venue = require("../models/Venue");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { getBookedDates } = require("../services/availability");

/**
 * Safely extract Cloudinary URLs from multer-storage-cloudinary file objects.
 */
function getImageUrlsFromFiles(files) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    return [];
  }
  return files
    .map((file) => {
      if (!file) return null;
      return file.path || file.secure_url || file.url || null;
    })
    .filter(Boolean);
}

exports.getVenues = asyncHandler(async (req, res) => {
  const venues = await Venue.find().sort({ createdAt: -1 });
  res.json(venues);
});

exports.getOwnerVenues = asyncHandler(async (req, res) => {
  const ownerId = req.user._id || req.user.id;
  const venues = await Venue.find({ ownerId }).sort({ createdAt: -1 });
  res.json(venues);
});

exports.getVenueById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "INVALID_ID", "Invalid venue ID format");
  }

  const venue = await Venue.findById(id);
  if (!venue) {
    throw new ApiError(404, "NOT_FOUND", "Venue not found");
  }

  res.json(venue);
});

exports.getVenueAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "INVALID_ID", "Invalid venue ID format");
  }

  const venue = await Venue.findById(id);
  if (!venue) {
    throw new ApiError(404, "NOT_FOUND", "Venue not found");
  }

  const monthStr = req.validated?.query?.month || req.query.month;
  if (!monthStr) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "Month query parameter is required"
    );
  }

  const [yearStr, monthNumStr] = monthStr.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10);

  const bookedDates = await getBookedDates(id, year, month);

  res.json({
    venueId: id,
    month: monthStr,
    bookedDates,
  });
});

exports.createVenue = asyncHandler(async (req, res) => {
  const data = req.validated?.body || req.body;
  const ownerId = req.user._id || req.user.id;

  const newUrls = getImageUrlsFromFiles(req.files);

  const venue = new Venue({
    name: data.name,
    location: data.location,
    capacity: data.capacity,
    pricePerDay: data.pricePerDay,
    description: data.description,
    services: data.services || [],
    ownerId,
    images: newUrls,
  });

  const savedVenue = await venue.save();
  res.status(201).json(savedVenue);
});

exports.updateVenue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "INVALID_ID", "Invalid venue ID format");
  }

  const venue = await Venue.findById(id);
  if (!venue) {
    throw new ApiError(404, "NOT_FOUND", "Venue not found");
  }

  // Ownership check
  if (String(venue.ownerId) !== String(req.user._id || req.user.id)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You do not have permission to modify this venue"
    );
  }

  const data = req.validated?.body || req.body;

  // Handle images merging
  let existingUrls = Array.isArray(venue.images) ? [...venue.images] : [];
  if (data.existingImages !== undefined) {
    existingUrls = Array.isArray(data.existingImages) ? data.existingImages : [];
  }

  const newUrls = getImageUrlsFromFiles(req.files);
  const mergedImages =
    newUrls.length > 0 ? [...existingUrls, ...newUrls] : existingUrls;

  if (data.name !== undefined) venue.name = data.name;
  if (data.location !== undefined) venue.location = data.location;
  if (data.capacity !== undefined) venue.capacity = data.capacity;
  if (data.pricePerDay !== undefined) venue.pricePerDay = data.pricePerDay;
  if (data.description !== undefined) venue.description = data.description;
  if (data.services !== undefined) venue.services = data.services;
  venue.images = mergedImages;

  const updatedVenue = await venue.save();
  res.json(updatedVenue);
});

exports.deleteVenue = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "INVALID_ID", "Invalid venue ID format");
  }

  const venue = await Venue.findById(id);
  if (!venue) {
    throw new ApiError(404, "NOT_FOUND", "Venue not found");
  }

  // Ownership check
  if (String(venue.ownerId) !== String(req.user._id || req.user.id)) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "You do not have permission to delete this venue"
    );
  }

  await venue.deleteOne();

  res.json({ message: "Venue deleted", id });
});