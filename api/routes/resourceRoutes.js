// In routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
// Import the specific uploader from your new config
const { uploadResource } = require('../config/cloudinaryConfig');
const {
    getResources,
    createResource,
    deleteResource
} = require('../controllers/resourceController');

// Define the routes using the new Cloudinary uploader
router.route('/').get(getResources).post(uploadResource.single('resourceFile'), createResource);
router.route('/:id').delete(deleteResource);

module.exports = router;