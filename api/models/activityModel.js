const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an activity title'],
    },
    description: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    imageUrl: {
      type: String, // We will store the path to the uploaded image here
      required: true,
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Activity', activitySchema);