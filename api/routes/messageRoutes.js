const express = require('express');
const router = express.Router();
const { getConversation, sendMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// --- FIX: Specific portal routes MUST be defined BEFORE generic teacher routes ---

// --- Parent/Student Portal Routes (Protected) ---
// Get their own conversation
router.route('/portal/conversation').get(protect, getConversation);
// Send a message to the teacher
router.route('/portal/conversation').post(protect, sendMessage);


// --- Teacher Routes ---
// Get conversation for a specific student
router.route('/:studentId').get(getConversation);
// Send a message to a specific student's parent
router.route('/:studentId').post(sendMessage);


module.exports = router;