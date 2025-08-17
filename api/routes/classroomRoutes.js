const express = require('express');
const router = express.Router();
const { getClassrooms, createClassroom, getClassroomsWithStudents } = require('../controllers/classroomController');

router.route('/').get(getClassrooms).post(createClassroom);
router.route('/with-students').get(getClassroomsWithStudents);

module.exports = router;