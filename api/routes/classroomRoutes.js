const express = require('express');
const router = express.Router();
const { 
    getClassrooms, 
    createClassroom, 
    getClassroomsWithStudents,
    deleteClassroom // Import the new function
} = require('../controllers/classroomController');

router.route('/').get(getClassrooms).post(createClassroom);
router.route('/with-students').get(getClassroomsWithStudents);
router.route('/:id').delete(deleteClassroom); // Add this line for deleting

module.exports = router;