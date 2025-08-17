// In routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { loginWithAccessCode } = require('../controllers/authController');

router.post('/login', loginWithAccessCode);

module.exports = router;