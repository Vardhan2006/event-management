const cloudinary = require("cloudinary").v2;

const cloudName = process.env.CLOUD_NAME;
const apiKey = process.env.CLOUD_API_KEY;
const apiSecret = process.env.CLOUD_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    "[cloudinary] Missing env vars. Set CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET in backend/.env (KEY=value format only)."
  );
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

module.exports = cloudinary;