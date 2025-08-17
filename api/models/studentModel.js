const mongoose = require('mongoose');

// NEW: Define a specific schema for each attendance record
const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    required: true,
  },
});

// This is the blueprint for each student record
const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a student name'],
    },
    classroomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Classroom',
    },
    dateOfBirth: {
      type: Date,
    },
    address: {
      type: String,
    },
    photograph: {
      type: String,
    },
    parents:
    {
      fatherName: { type: String },
      fatherContact: { type: String },
      motherName: { type: String },
      motherContact: { type: String },
    },
    // UPDATED: The attendance field now uses our new, specific schema
    attendance: [attendanceSchema],
    teacherObservation: {
      type: String,
    },
    
     badges: {
      type: [String], // Defines an array of strings
      default: [],    // Defaults to an empty array
    },
    
    studentAccessCode: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values but unique values if they exist
    },
    parentAccessCode: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  
  
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);