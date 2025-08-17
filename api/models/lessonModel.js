// In models/lessonModel.js
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a lesson title'],
      trim: true,
    },
    subject: {
      type: String,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    objectives: {
      type: String, // For longer text, like learning goals
    },
    notes: {
      type: String, // For teacher's personal notes
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Classroom',
    },
     linkedResources: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource' // This tells Mongoose to link to the Resource model
    }],
  },
  
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Lesson', lessonSchema);