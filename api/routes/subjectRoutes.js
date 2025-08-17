// In routes/subjectRoutes.js
const express = require('express');
const router = express.Router();
const { getSubjects, createSubject, deleteSubject } = require('../controllers/subjectController');

router.route('/').get(getSubjects).post(createSubject);
router.route('/:id').delete(deleteSubject);

module.exports = router;