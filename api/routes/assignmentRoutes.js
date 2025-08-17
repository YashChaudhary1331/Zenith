// In routes/assignmentRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getAssignments, 
  createAssignment, 
  upsertAssignmentMarks,
  deleteAssignment,
  getUniqueSubjects, // Import the new function
} = require('../controllers/assignmentController');

// --- ADD THIS NEW ROUTE ---
router.route('/subjects').get(getUniqueSubjects);
// -------------------------

router.route('/').get(getAssignments).post(createAssignment);
router.route('/:id/marks').put(upsertAssignmentMarks);
router.route('/:id').delete(deleteAssignment);

module.exports = router;