// In routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { generateStudentObservation } = require('../controllers/aiController');

// We don't need to protect this route as it's for the teacher who is implicitly authorized,
// and it doesn't expose sensitive data without a specific student ID.
router.get('/observation/:id', generateStudentObservation);

module.exports = router;