const express = require('express');
const router = express.Router();
// Import the specific uploader from your new config
const { uploadAvatar } = require('../config/cloudinaryConfig'); 
const { 
  getStudents, 
  createStudent, 
  deleteStudent, 
  updateStudent,
  generateAccessCodes,
} = require('../controllers/studentController');

// Use the new Cloudinary uploader middleware
router.route('/').get(getStudents).post(uploadAvatar.single('photograph'), createStudent);
router.route('/:id').delete(deleteStudent).put(uploadAvatar.single('photograph'), updateStudent); 
router.route('/:id/generate-codes').post(generateAccessCodes);

module.exports = router;