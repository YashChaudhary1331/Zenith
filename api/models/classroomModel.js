const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a class name'],
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    // Important: Enable virtuals when converting to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create a virtual property `students` that finds all students belonging to this classroom
classroomSchema.virtual('students', {
  ref: 'Student',
  localField: '_id',
  foreignField: 'classroomId',
  justOne: false,
});

module.exports = mongoose.model('Classroom', classroomSchema);