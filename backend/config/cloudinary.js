const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ─────────────────────────────────────────────────────────────────────────────
// CLOUDINARY CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
// Cloudinary is used to host images because Render's free instances use a 
// read-only filesystem. This ensures our Event and Profile images persist
// across server restarts and deployments.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─────────────────────────────────────────────────────────────────────────────
// EVENT IMAGE STORAGE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const eventStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'geovibe/events',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 1000, height: 600, crop: 'limit' }]
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE IMAGE STORAGE ENGINE
// ─────────────────────────────────────────────────────────────────────────────
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'geovibe/profiles',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  }
});

module.exports = {
  cloudinary,
  eventStorage,
  profileStorage
};
