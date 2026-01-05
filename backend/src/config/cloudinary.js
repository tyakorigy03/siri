
// src/config/cloudinary.js - Cloudinary Configuration
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test connection
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connected'))
  .catch(err => console.error('❌ Cloudinary connection error:', err.message));

module.exports = cloudinary;