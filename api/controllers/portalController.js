// In controllers/portalController.js
const Student = require('../models/studentModel');
const Assignment = require('../models/assignmentModel');
const Activity = require('../models/activityModel');

// @desc    Get all data for the parent/student portal
// @route   GET /api/portal/data
const getPortalData = async (req, res) => {
    // req.user is available here because of our 'protect' middleware
    const studentId = req.user.studentId;

    // 1. Get Student Personal and Attendance Data
    const student = await Student.findById(studentId).select('-studentAccessCode -parentAccessCode');
    if (!student) {
        return res.status(404).json({ message: 'Student data not found.' });
    }

    // 2. Get Student's Marks from all assignments
    const assignments = await Assignment.find({ 'marks.studentId': studentId });
    const studentMarks = assignments.map(assignment => {
        const mark = assignment.marks.find(m => m.studentId.toString() === studentId);
        return {
            assignmentName: assignment.assignmentName,
            subject: assignment.subject,
            maxScore: assignment.maxScore,
            score: mark.score,
            percentage: ((mark.score / assignment.maxScore) * 100).toFixed(1),
        };
    });

    // 3. Get Classroom Activities
    const activities = await Activity.find({ classroomId: student.classroomId }).sort({ date: -1 });

    // 4. Send all data back
    res.json({
        studentDetails: student,
        marks: studentMarks,
        activities: activities,
    });
};

module.exports = { getPortalData };