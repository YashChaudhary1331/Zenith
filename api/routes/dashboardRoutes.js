const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

// A single route to get all dashboard statistics
router.route('/stats').get(getDashboardStats);

module.exports = router;