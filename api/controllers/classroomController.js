const Classroom = require('../models/classroomModel');
const Student = require('../models/studentModel');

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

const deleteClassroom = async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Also delete all students in this classroom
        await Student.deleteMany({ classroomId: req.params.id });
        await Classroom.findByIdAndDelete(req.params.id);

        res.status(200).json({ id: req.params.id, message: 'Classroom and all associated students removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting classroom', error: error.message });
    }
};

module.exports = {
  getClassrooms,
  createClassroom,
  getClassroomsWithStudents,
  deleteClassroom,
};