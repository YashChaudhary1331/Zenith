// In api/config/cloudinaryConfig.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const express = require('express');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for student avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'zenith/avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 200, height: 200, crop: 'fill' }]
  },
});

// Configure storage for activity images
const activityStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'zenith/activities',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

// Configure storage for file resources
const resourceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'zenith/resources',
    resource_type: 'auto', // Allows uploading PDFs, documents, etc.
  },
});

// Configure storage for the school logo
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'zenith/templates',
    public_id: 'school-logo', // Always use the same name to overwrite
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const uploadAvatar = multer({ storage: avatarStorage });
const uploadActivity = multer({ storage: activityStorage });
const uploadResource = multer({ storage: resourceStorage });
const uploadLogo = multer({ storage: logoStorage });


module.exports = {
    cloudinary,
    uploadAvatar,
    uploadActivity,
    uploadResource,
    uploadLogo
};