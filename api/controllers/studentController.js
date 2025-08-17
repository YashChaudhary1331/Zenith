const Student = require('../models/studentModel');
const { nanoid } = require('nanoid');
const { cloudinary } = require('../config/cloudinaryConfig'); // Import Cloudinary

// Helper to extract public_id from Cloudinary URL
const getPublicId = (url) => url.split('/').slice(-3).join('/').split('.')[0];

// @desc    Get students, optionally filtered by class
const getStudents = async (req, res) => {
    try {
        let query = {};
        if (req.query.classId) {
            query.classroomId = req.query.classId;
        }
        const students = await Student.find(query);
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching students', error: error.message });
    }
};

// @desc    Create a new student
const createStudent = async (req, res) => {
    try {
        const { name, classroomId, address, parents, dateOfBirth, teacherObservation, badges } = req.body;
        if (!name || !classroomId) {
            return res.status(400).json({ message: 'Please provide name and classroomId' });
        }
        const studentData = {
            name,
            address,
            parents: JSON.parse(parents || '{}'),
            classroomId,
            teacherObservation,
            badges: badges || [],
        };
        if (dateOfBirth) studentData.dateOfBirth = dateOfBirth;
        if (req.file) {
            studentData.photograph = req.file.path; // Save the Cloudinary URL
        }
        const student = await Student.create(studentData);
        res.status(201).json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error creating student', error: error.message });
    }
};

// @desc    Update a student
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { name, address, parents, dateOfBirth, teacherObservation, badges } = req.body;

        student.name = name || student.name;
        student.address = address !== undefined ? address : student.address;
        student.parents = parents ? JSON.parse(parents) : student.parents;
        student.teacherObservation = teacherObservation !== undefined ? teacherObservation : student.teacherObservation;
        
        if (badges !== undefined) {
             student.badges = Array.isArray(badges) ? badges : [badges];
        } else {
            student.badges = [];
        }

        if (dateOfBirth) {
            student.dateOfBirth = dateOfBirth;
        } else {
            student.dateOfBirth = undefined;
        }

        if (req.file) {
            // If there was an old photo, delete it from Cloudinary
            if (student.photograph) {
                const publicId = getPublicId(student.photograph);
                cloudinary.uploader.destroy(publicId);
            }
            student.photograph = req.file.path; // Save the new Cloudinary URL
        }

        const updatedStudent = await student.save();
        res.status(200).json(updatedStudent);
    } catch (error) {
        console.error("Update Student Error:", error);
        res.status(500).json({ message: 'Error updating student', error: error.message });
    }
};

// @desc    Delete a student
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        // If the student has a photograph, delete it from Cloudinary
        if (student.photograph) {
            const publicId = getPublicId(student.photograph);
            cloudinary.uploader.destroy(publicId);
        }
        await Student.findByIdAndDelete(req.params.id);
        res.status(200).json({ id: req.params.id, message: 'Student removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student', error: error.message });
    }
};

// @desc    Generate access codes for a student
const generateAccessCodes = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (!student.studentAccessCode) {
            student.studentAccessCode = `s_${nanoid(8)}`;
        }
        if (!student.parentAccessCode) {
            student.parentAccessCode = `p_${nanoid(10)}`;
        }
        const updatedStudent = await student.save();
        res.status(200).json({
            studentAccessCode: updatedStudent.studentAccessCode,
            parentAccessCode: updatedStudent.parentAccessCode,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating access codes', error: error.message });
    }
};

module.exports = {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  generateAccessCodes,
};