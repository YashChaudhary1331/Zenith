const Student = require('../models/studentModel');

// @desc    Add multiple attendance records in a batch
// @route   POST /api/attendance/batch
const addAttendanceInBatch = async (req, res) => {
  const records = req.body;

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ message: 'Invalid data format. Expecting an array of records.' });
  }

  try {
    for (const record of records) {
      const student = await Student.findById(record.studentId);
      if (student) {
        if (!student.attendance) {
          student.attendance = [];
        }

        const recordIndex = student.attendance.findIndex(
          att => new Date(att.date).toDateString() === new Date(record.date).toDateString()
        );

        if (recordIndex > -1) {
          student.attendance[recordIndex].status = record.status;
        } else {
          student.attendance.push({ date: record.date, status: record.status });
        }

        // --- THIS IS THE FIX ---
        // Explicitly tell Mongoose that the attendance array has been modified
        student.markModified('attendance');
        // ---------------------

        await student.save();
      }
    }
    res.status(201).json({ message: 'Attendance saved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while saving attendance.', error: error.message });
  }
};

module.exports = {
  addAttendanceInBatch,
};