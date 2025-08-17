// In routes/lessonRoutes.js
const express = require('express');
const router = express.Router();
const {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/lessonController');

router.route('/').get(getLessons).post(createLesson);
router.route('/:id').put(updateLesson).delete(deleteLesson);

module.exports = router;    