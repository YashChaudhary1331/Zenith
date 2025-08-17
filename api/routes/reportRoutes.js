// In routes/reportRoutes.js
const express = require('express');
const router = express.Router();
// Import the specific uploader from your new config
const { uploadLogo } = require('../config/cloudinaryConfig');
const { generateReportCard, saveReportConfig } = require('../controllers/reportController');

// --- ROUTES ---
router.get('/report-card/:studentId', generateReportCard);
// Use the new Cloudinary uploader middleware
router.post('/save-config', uploadLogo.single('schoolLogo'), saveReportConfig);

module.exports = router;