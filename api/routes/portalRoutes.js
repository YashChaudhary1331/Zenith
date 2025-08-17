// In routes/portalRoutes.js
const express = require('express');
const router = express.Router();
const { getPortalData } = require('../controllers/portalController');
const { protect } = require('../middleware/authMiddleware');

// This route is protected. The 'protect' middleware will run first.
router.get('/data', protect, getPortalData);

module.exports = router;