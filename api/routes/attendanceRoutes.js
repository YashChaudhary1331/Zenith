const express = require('express');
const router = express.Router();
const { addAttendanceInBatch } = require('../controllers/attendanceController');

router.route('/batch').post(addAttendanceInBatch);

module.exports = router;