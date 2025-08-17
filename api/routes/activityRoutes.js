const express = require('express');
const router = express.Router();
// Import the specific uploader from your new config
const { uploadActivity } = require('../config/cloudinaryConfig');
const { getActivitiesByClass, createActivity, deleteActivity } = require('../controllers/activityController');

// Use the new Cloudinary uploader middleware
router.route('/').get(getActivitiesByClass).post(uploadActivity.single('image'), createActivity);
router.route('/:id').delete(deleteActivity);

module.exports = router;