const Assignment = require('../models/assignmentModel');

// @desc    Get assignments, filtered by class
// @route   GET /api/assignments
const getAssignments = async (req, res) => {
  let query = {};
  // If a classId is provided in the URL query, filter assignments by it
  if (req.query.classId) {
    query.classroomId = req.query.classId;
  }
  const assignments = await Assignment.find(query).sort({ createdAt: -1 });
  res.status(200).json(assignments);
};

// @desc    Get all unique subjects
// @route   GET /api/assignments/subjects
const getUniqueSubjects = async (req, res) => {
    try {
        const subjects = await Assignment.distinct('subject');
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Could not fetch subjects', error: error.message });
    }
};
// @desc    Create a new assignment
// @route   POST /api/assignments
// In controllers/assignmentController.js

const createAssignment = async (req, res) => {
  // 1. We added 'dueDate' here to receive it from the form
  const { assignmentName, subject, classroomId, maxScore, dueDate } = req.body; 
  
  if (!assignmentName || !subject || !classroomId || !maxScore) {
    res.status(400).send('Assignment name, subject, classroomId, and maxScore are required.');
    return;
  }
  
  const assignment = await Assignment.create({
    assignmentName,
    subject,
    classroomId,
    maxScore,
    dueDate: dueDate || null, // 2. We now save the dueDate to the database
    marks: [],
  });
  
  res.status(201).json(assignment);
};

// @desc    Add/Update marks for an assignment
// @route   PUT /api/assignments/:id/marks
const upsertAssignmentMarks = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404).send('Assignment not found.');
    return;
  }
  // The body will contain the array of marks
  assignment.marks = req.body.marks;
  const updatedAssignment = await assignment.save();
  res.status(200).json(updatedAssignment);
};
// Add this new function inside assignmentController.js
// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
const deleteAssignment = async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  await Assignment.findByIdAndDelete(req.params.id);

  res.status(200).json({ id: req.params.id, message: 'Assignment removed' });
};

// Update your module.exports at the bottom of the file
module.exports = {
  getUniqueSubjects,
  getAssignments,
  createAssignment,
  upsertAssignmentMarks,
  deleteAssignment, // <-- ADD THIS
};
