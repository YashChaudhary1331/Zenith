const Classroom = require('../models/classroomModel');

// @desc    Get all classrooms
// @route   GET /api/classrooms
const getClassrooms = async (req, res) => {
  const classrooms = await Classroom.find({}).sort({ name: 1 }); // Sort by name
  res.status(200).json(classrooms);
};

// @desc    Create a new classroom
// @route   POST /api/classrooms
const createClassroom = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).send('Classroom name is required.');
    return;
  }
  const classroom = await Classroom.create({ name });
  res.status(201).json(classroom);
};
const getClassroomsWithStudents = async (req, res) => {
  const classrooms = await Classroom.find({}).populate('students').sort({ name: 1 });
  res.status(200).json(classrooms);
};

module.exports = {
  getClassrooms,
  createClassroom,
  getClassroomsWithStudents,
};