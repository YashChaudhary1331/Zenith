const Message = require('../models/messageModel');

// @desc    Get all messages for a specific conversation
const getConversation = async (req, res) => {
    try {
        const studentId = req.user ? req.user.studentId : req.params.studentId;
        const messages = await Message.find({ conversationId: studentId.toString() }).sort({ createdAt: 'asc' });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversation', error: error.message });
    }
};

// @desc    Send a new message
const sendMessage = async (req, res) => {
    try {
        const { messageText } = req.body;
        const studentId = req.user ? req.user.studentId : req.params.studentId;
        const senderRole = req.user ? req.user.role : 'teacher';

        if (!messageText) {
            return res.status(400).json({ message: 'Message text cannot be empty.' });
        }

        const message = await Message.create({
            conversationId: studentId.toString(),
            senderRole,
            messageText,
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error: error.message });
    }
};

module.exports = {
    getConversation,
    sendMessage,
};