const Classroom = require('../models/classroomModel');
const Student = require('../models/studentModel');
const Activity = require('../models/activityModel');
const Assignment = require('../models/assignmentModel');
const mongoose = require('mongoose');

// @desc    Get all calculated stats for the dashboard
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const { classId, subject } = req.query;
    const classFilter = classId ? { classroomId: new mongoose.Types.ObjectId(classId) } : {};

    // --- Fetch all necessary data ---
    const totalClassrooms = await Classroom.countDocuments();
    let students = await Student.find(classFilter);
    let assignments = await Assignment.find(classFilter);
    
    // --- NEW: Filter assignments by subject if provided ---
    if (subject) {
      assignments = assignments.filter(a => a.subject === subject);
      // We also need to filter students to only those who have marks in this subject
      const studentsWithMarks = new Set(assignments.flatMap(a => a.marks.map(m => m.studentId.toString())));
      students = students.filter(s => studentsWithMarks.has(s._id.toString()));
    }
    
    const recentActivities = await Activity.find(classFilter).sort({ date: -1 }).limit(5);

    // --- Existing calculations ---
    let totalStudents = students.length;
    let totalAttendanceSum = 0;
    let studentsWithAttendance = 0;
    let lowAttendanceStudents = [];
    let todaysAttendance = { present: 0, absent: 0, late: 0 };
    const todayString = new Date().toDateString();
    
    students.forEach(student => {
      if (student.attendance && student.attendance.length > 0) {
        const present = student.attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const percentage = (present / student.attendance.length) * 100;
        totalAttendanceSum += percentage;
        studentsWithAttendance++;
        if (percentage < 80) {
          lowAttendanceStudents.push({ name: student.name, photograph: student.photograph, percentage: Math.round(percentage) });
        }
        const todayRecord = student.attendance.find(att => new Date(att.date).toDateString() === todayString);
        if (todayRecord) {
            if (todayRecord.status === 'Present') todaysAttendance.present++;
            else if (todayRecord.status === 'Absent') todaysAttendance.absent++;
            else if (todayRecord.status === 'Late') todaysAttendance.late++;
        }
      }
    });
    const averageAttendance = studentsWithAttendance > 0 ? Math.round(totalAttendanceSum / studentsWithAttendance) : 0;
    
    const studentPerformance = new Map();
    students.forEach(student => {
      studentPerformance.set(student._id.toString(), { highScores: 0, lowScores: 0, name: student.name, photograph: student.photograph });
    });
    assignments.forEach(assignment => {
      if (assignment.marks && assignment.marks.length > 0) {
        assignment.marks.forEach(mark => {
          const studentId = mark.studentId.toString();
          if (studentPerformance.has(studentId)) {
            const percentage = (mark.score / assignment.maxScore) * 100;
            const studentStats = studentPerformance.get(studentId);
            if (percentage > 80) studentStats.highScores++;
            if (percentage < 35) studentStats.lowScores++;
          }
        });
      }
    });
    const highPerformersList = Array.from(studentPerformance.values()).filter(s => s.highScores >= 3);
    const lowPerformanceStudents = Array.from(studentPerformance.values()).filter(s => s.lowScores >= 2);

    const subjectPerformance = assignments.reduce((acc, assignment) => {
        const subject = assignment.subject || 'General';
        if (!acc[subject]) acc[subject] = { totalPercentage: 0, count: 0 };
        if (assignment.marks && assignment.marks.length > 0) {
            const avgPercentage = assignment.marks.reduce((sum, mark) => sum + (mark.score / assignment.maxScore) * 100, 0) / assignment.marks.length;
            acc[subject].totalPercentage += avgPercentage;
            acc[subject].count++;
        }
        return acc;
    }, {});
    const subjectAverages = Object.keys(subjectPerformance).map(subject => ({
        subject,
        average: subjectPerformance[subject].count > 0 ? Math.round(subjectPerformance[subject].totalPercentage / subjectPerformance[subject].count) : 0,
    }));

    // --- Date-based calculations ---
    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);
    const nextWeekUTC = new Date(todayUTC);
    nextWeekUTC.setDate(nextWeekUTC.getDate() + 7);

    const upcomingDeadlines = assignments.filter(assignment => {
        if (!assignment.dueDate) return false;
        return assignment.dueDate >= todayUTC && assignment.dueDate < nextWeekUTC;
    }).sort((a, b) => a.dueDate - b.dueDate);

    const upcomingBirthdays = students.filter(student => {
      if (!student.dateOfBirth) return false;
      const today = new Date();
      const birthDateThisYear = new Date(student.dateOfBirth);
      birthDateThisYear.setFullYear(today.getFullYear());
      const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const birthDateNoTime = new Date(birthDateThisYear.getFullYear(), birthDateThisYear.getMonth(), birthDateThisYear.getDate());
      const weekFromTodayNoTime = new Date(todayNoTime);
      weekFromTodayNoTime.setDate(todayNoTime.getDate() + 7);
      return birthDateNoTime >= todayNoTime && birthDateNoTime < weekFromTodayNoTime;
    }).sort((a,b) => new Date(a.dateOfBirth).setFullYear(new Date().getFullYear()) - new Date(b.dateOfBirth).setFullYear(new Date().getFullYear()));


    // --- FINAL: Calculate Class Performance Trend using Aggregation ---
    const performanceTrend = await Assignment.aggregate([
      { $match: { ...classFilter, ...(subject && { subject }) } },
      { $unwind: '$marks' },
      {
        $project: {
          percentage: { $multiply: [{ $divide: ['$marks.score', '$maxScore'] }, 100] },
          week: { $isoWeek: '$createdAt' },
          year: { $isoWeekYear: '$createdAt' },
        },
      },
      {
        $group: {
          _id: { year: '$year', week: '$week' },
          averageScore: { $avg: '$percentage' },
        },
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      {
        $project: {
          _id: 0,
          label: { $concat: ['Week ', { $toString: '$_id.week' }] },
          averageScore: { $round: ['$averageScore', 1] },
        },
      },
    ]);

    // --- Final Stats Object ---
    const finalStats = {
      totalClassrooms,
      totalStudents,
      averageAttendance,
      lowAttendanceStudents: lowAttendanceStudents.slice(0, 5),
      lowPerformanceStudents: lowPerformanceStudents.slice(0, 5),
      highPerformersList: highPerformersList.slice(0, 5),
      recentActivities,
      todaysAttendance,
      upcomingBirthdays: upcomingBirthdays.slice(0, 5),
      upcomingDeadlines: upcomingDeadlines.slice(0, 3),
      subjectAverages,
      performanceTrend,
    };

    res.status(200).json(finalStats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: 'Server error while fetching dashboard stats.' });
  }
};

module.exports = {
  getDashboardStats,
};