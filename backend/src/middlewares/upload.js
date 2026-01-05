
// src/middlewares/upload.js - File Upload Middleware (Multer + Cloudinary)
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// Multer memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,pdf,xlsx,xls,csv').split(',');
  const fileExtension = file.originalname.split('.').pop().toLowerCase();

  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: fileFilter
});

// Upload to Cloudinary
const uploadToCloudinary = (buffer, folder = 'general') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `business-management/${folder}`,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            size: result.bytes
          });
        }
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

// Middleware to handle single file upload
exports.uploadSingle = (fieldName, folder = 'general') => {
  return async (req, res, next) => {
    // Use multer to handle the upload
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return next();
      }

      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer, folder);
        req.cloudinaryResult = result;
        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading file',
          error: error.message
        });
      }
    });
  };
};

// Middleware to handle multiple files upload
exports.uploadMultiple = (fieldName, maxCount = 5, folder = 'general') => {
  return async (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.files || req.files.length === 0) {
        return next();
      }

      try {
        // Upload all files to Cloudinary
        const uploadPromises = req.files.map(file => 
          uploadToCloudinary(file.buffer, folder)
        );
        
        const results = await Promise.all(uploadPromises);
        req.cloudinaryResults = results;
        next();
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: 'Error uploading files',
          error: error.message
        });
      }
    });
  };
};

// Delete file from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Error deleting file from Cloudinary: ${error.message}`);
  }
};

module.exports = exports;