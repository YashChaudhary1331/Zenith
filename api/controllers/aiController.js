// In controllers/aiController.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Student = require('../models/studentModel');
const Assignment = require('../models/assignmentModel');

// Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Generate a student observation
// @route   GET /api/ai/observation/:id
const generateStudentObservation = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const assignments = await Assignment.find({ 'marks.studentId': studentId });
        
        let dataSummary = `Student Name: ${student.name}\n`;
        const totalDays = student.attendance.length;
        const presentDays = student.attendance.filter(a => a.status !== 'Absent').length;
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(0) : 'N/A';
        dataSummary += `Overall Attendance: ${attendancePercentage}%\n`;

        if (assignments.length > 0) {
            dataSummary += "Performance:\n";
            assignments.forEach(assignment => {
                const mark = assignment.marks.find(m => m.studentId.toString() === studentId);
                if (mark) {
                    const percentage = ((mark.score / assignment.maxScore) * 100).toFixed(0);
                    dataSummary += `- ${assignment.subject} (${assignment.assignmentName}): ${percentage}%\n`;
                }
            });
        } else {
            dataSummary += "Performance: No marks recorded yet.\n";
        }

        const prompt = `
            You are an experienced and thoughtful teacher writing a student observation for a report card.
            Based on the following data summary, write a 2-3 sentence observation.
            The tone should be constructive and balanced, highlighting both strengths and areas for potential improvement.
            Do not just repeat the numbers; interpret the data into a helpful comment.

            Data Summary:
            ---
            ${dataSummary}
            ---
            
            Observation:
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = result.response;

        if (!response.text || typeof response.text !== 'function' || !response.text()) {
            console.error("AI Response Blocked or Empty. Reason:", response.promptFeedback || "Unknown");
            return res.status(500).json({ message: 'Response from AI was blocked due to safety filters. Please check the server terminal for details.' });
        }

        const observationText = response.text();
        res.status(200).json({ observation: observationText });

    } catch (error) {
        console.error("AI generation error:", error);
        // Send the specific, detailed error message back to the browser
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateStudentObservation };