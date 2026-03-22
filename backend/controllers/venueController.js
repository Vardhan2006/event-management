const Venue = require("../models/Venue");

/**
 * Safely extract Cloudinary URLs from multer-storage-cloudinary file objects.
 * multer-storage-cloudinary sets `path` to `secure_url` from Cloudinary.
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

/**
 * Parse services from multipart body (string, JSON string, or comma-separated).
 */
function parseServices(raw) {
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) return raw.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {
      // not JSON — treat as comma-separated
    }
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

exports.createVenue = async (req, res) => {
  try {
    // multipart: fields are strings
    const {
      name,
      location,
      capacity,
      pricePerDay,
      description,
      services: servicesRaw,
      ownerId
    } = req.body;

    if (!name || !location || ownerId == null || String(ownerId).trim() === "") {
      return res.status(400).json({ message: "name, location, and ownerId are required" });
    }

    const cap = Number(capacity);
    const price = Number(pricePerDay ?? 0);
    if (Number.isNaN(cap) || Number.isNaN(price)) {
      return res.status(400).json({ message: "capacity and pricePerDay must be numbers" });
    }

    // Debug (safe: log structure, not full buffers)
    console.log("[createVenue] req.files:", req.files);
    if (req.files?.length) {
      req.files.forEach((f, i) => {
        console.log(`[createVenue] file[${i}] fieldname=${f?.fieldname} path=${f?.path}`);
      });
    }

    const imageUrls = getImageUrlsFromFiles(req.files);
    console.log("[createVenue] imageUrls to save:", imageUrls);

    const venue = new Venue({
      name: name?.trim(),
      location: location?.trim(),
      capacity: cap,
      pricePerDay: price,
      description: description?.trim() ?? "",
      services: parseServices(servicesRaw),
      ownerId: String(ownerId),
      images: imageUrls
    });

    const savedVenue = await venue.save();
    console.log("[createVenue] saved venue id:", savedVenue._id, "images count:", savedVenue.images?.length);

    res.status(201).json(savedVenue);
  } catch (error) {
    console.error("[createVenue] error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });

    res.json(venues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: "Venue not found" });
    }

    res.json(venue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};