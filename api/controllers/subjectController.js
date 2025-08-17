// In controllers/subjectController.js
const Subject = require('../models/subjectModel');

// @desc    Get all subjects
// @route   GET /api/subjects
const getSubjects = async (req, res) => {
    const subjects = await Subject.find({}).sort({ name: 1 });
    res.status(200).json(subjects);
};

// @desc    Create a new subject
// @route   POST /api/subjects
const createSubject = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Subject name is required.' });
    }
    const subject = await Subject.create({ name });
    res.status(201).json(subject);
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
        return res.status(404).json({ message: 'Subject not found.' });
    }
    res.status(200).json({ id: req.params.id, message: 'Subject removed.' });
};

module.exports = { getSubjects, createSubject, deleteSubject };