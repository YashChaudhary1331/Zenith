const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    assignmentName: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 1, // Max score must be at least 1
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    // This will store all the scores for this one assignment
    marks: [
      {
        studentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student', // This links to a student in the Student collection
          required: true,
        },
        studentName: { // Storing name here for easier display
          type: String,
          required: true,
        },
        score: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Assignment', assignmentSchema);