// In controllers/authController.js
const jwt = require('jsonwebtoken');
const Student = require('../models/studentModel');

// Helper function to generate a token
const generateToken = (studentId, role) => {
  return jwt.sign({ studentId, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Authenticate with an access code
// @route   POST /api/auth/login
const loginWithAccessCode = async (req, res) => {
  const { accessCode } = req.body;

  if (!accessCode) {
    return res.status(400).json({ message: 'Please provide an access code' });
  }

  // Find a student that matches the code in either field
  const student = await Student.findOne({
    $or: [{ studentAccessCode: accessCode }, { parentAccessCode: accessCode }],
  });

  if (student) {
    // Determine if the user is a student or a parent
    const role = student.studentAccessCode === accessCode ? 'student' : 'parent';
    
    res.json({
      _id: student._id,
      name: student.name,
      role: role,
      token: generateToken(student._id, role), // Send the token back
    });
  } else {
    res.status(401).json({ message: 'Invalid access code' });
  }
};

module.exports = { loginWithAccessCode };