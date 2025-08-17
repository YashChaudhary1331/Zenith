// In controllers/lessonController.js
const Lesson = require('../models/lessonModel');

// @desc    Get lessons for a specific class
// @route   GET /api/lessons
const getLessons = async (req, res) => { 
    const lessons = await Lesson.find({ classroomId: req.query.classId })
    .populate('linkedResources')
    .sort({ startDate: 1 });
  res.status(200).json(lessons);
};

// @desc    Create a new lesson plan
// @route   POST /api/lessons
const createLesson = async (req, res) => {
  // We destructure all the expected fields from the request body
  const { title, subject, startDate, endDate, objectives, notes, classroomId, linkedResources } = req.body;

  // The validation remains the same
  if (!title || !startDate || !classroomId) {
    return res.status(400).json({ message: 'Title, start date, and classroom are required.' });
  }
  
  // --- THIS IS THE FIX ---
  // We build a clean object with only the data defined in our schema
  // instead of passing req.body directly.
  const lessonObject = {
      title,
      subject,
      startDate,
      endDate,
      objectives,
      notes,
      classroomId,
      linkedResources
  };

  const lesson = await Lesson.create(lessonObject);
  // -------------------------

  res.status(201).json(lesson);
};

// @desc    Update a lesson plan
// @route   PUT /api/lessons/:id
const updateLesson = async (req, res) => {
  const lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }
  res.status(200).json(lesson);
};

// @desc    Delete a lesson plan
// @route   DELETE /api/lessons/:id
const deleteLesson = async (req, res) => {
  const lesson = await Lesson.findByIdAndDelete(req.params.id);
  if (!lesson) {
    return res.status(404).json({ message: 'Lesson not found' });
  }
  res.status(200).json({ id: req.params.id, message: 'Lesson removed' });
};

module.exports = {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
};