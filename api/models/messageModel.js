const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      required: true,
      enum: ['teacher', 'parent', 'student'],
    },
    messageText: {
      type: String,
      required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema);