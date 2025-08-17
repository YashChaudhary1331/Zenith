// In controllers/reportController.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Student = require('../models/studentModel');
const Assignment = require('../models/assignmentModel');
const Classroom = require('../models/classroomModel');

// We no longer need the config file path as we'll handle the URL in the JSON
const CONFIG_FILE_PATH = path.join(__dirname, '..', 'config', 'report-config.json');

const saveReportConfig = async (req, res) => {
    try {
        const config = JSON.parse(req.body.configData);

        // If a new logo was uploaded, add its Cloudinary URL to the config
        if (req.file) {
            config.schoolLogoUrl = req.file.path;
        }

        const dir = path.dirname(CONFIG_FILE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2));
        res.status(200).json({ message: 'Configuration saved successfully.' });
    } catch (error) {
        console.error('Error saving config:', error);
        res.status(500).json({ message: 'Could not save configuration.' });
    }
};

const calculateGrade = (percentage, gradingScale) => {
    const sortedScale = gradingScale.sort((a, b) => b.min - a.min);
    for (const scale of sortedScale) {
        if (percentage >= scale.min) return scale.grade;
    }
    return 'F';
};

const generateReportCard = async (req, res) => {
    try {
        let config = { 
            schoolName: 'Zenith School', academicYear: '2024-2025', theme: 'blue', font: 'sans-serif',
            content: ['showDob', 'showAddress', 'showParentInfo', 'showPercentage', 'showGrade', 'attendance', 'observations'],
            gradingScale: [{ grade: 'A+', min: '90' }, { grade: 'A', min: '80' }, { grade: 'B', min: '70' }, { grade: 'C', min: '60' }, { grade: 'D', min: '50' }],
            schoolLogoUrl: '' // Add a default empty logo URL
        };
        if (fs.existsSync(CONFIG_FILE_PATH)) {
            config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'));
        }

        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).send('Student not found.');
        
        const classroom = await Classroom.findById(student.classroomId);
        const assignments = await Assignment.find({ 'marks.studentId': student._id });
        const attendancePercentage = student.attendance.length > 0 ? ((student.attendance.filter(a => a.status !== 'Absent').length / student.attendance.length) * 100).toFixed(0) : 'N/A';
        
        const themeColors = {
            blue: { primary: '#3B82F6', secondary: '#F0F5FF', text: '#1E2A38' },
            green: { primary: '#16A34A', secondary: '#F0FFF4', text: '#14532D' },
            grey: { primary: '#6B7280', secondary: '#F3F4F6', text: '#111827' }
        };
        const selectedTheme = themeColors[config.theme] || themeColors.blue;
        const selectedFont = config.font === 'serif' ? '"Times New Roman", Times, serif' : '"Segoe UI", sans-serif';

        // --- Use the URLs directly in the HTML ---
        const logoHtml = config.schoolLogoUrl ? `<img src="${config.schoolLogoUrl}" class="school-logo">` : '';
        const studentPhoto = student.photograph || ''; // This is already a Cloudinary URL

        // Marks Table Header and Body (no changes needed here)
        let marksTableHeader = '<tr><th>Subject</th><th>Assignment</th><th>Score</th>';
        if (config.content.includes('showPercentage')) marksTableHeader += '<th>Percentage</th>';
        if (config.content.includes('showGrade')) marksTableHeader += '<th>Grade</th>';
        marksTableHeader += '</tr>';

        const marksTableBody = assignments.map(a => {
            const mark = a.marks.find(m => m.studentId.equals(student._id));
            const percentage = ((mark.score / a.maxScore) * 100);
            let row = `<tr><td>${a.subject}</td><td>${a.assignmentName}</td><td>${mark.score}/${a.maxScore}</td>`;
            if (config.content.includes('showPercentage')) row += `<td>${percentage.toFixed(0)}%</td>`;
            if (config.content.includes('showGrade')) row += `<td>${calculateGrade(percentage, config.gradingScale)}</td>`;
            row += '</tr>';
            return row;
        }).join('');

        // Student and Parent Info (no changes needed here)
        let studentInfoHtml = `<p><strong>Student Name:</strong> ${student.name}</p><p><strong>Class:</strong> ${classroom.name}</p>`;
        if (config.content.includes('showDob')) studentInfoHtml += `<p><strong>Date of Birth:</strong> ${new Date(student.dateOfBirth).toLocaleDateString()}</p>`;
        if (config.content.includes('showAddress')) studentInfoHtml += `<p><strong>Address:</strong> ${student.address || 'N/A'}</p>`;
        
        let parentInfoHtml = '';
        if (config.content.includes('showParentInfo') || config.content.includes('showParentContact')) {
            let parentDetails = '';
            if (config.content.includes('showParentInfo')) parentDetails += `<p><strong>Father's Name:</strong> ${student.parents.fatherName || 'N/A'}</p><p><strong>Mother's Name:</strong> ${student.parents.motherName || 'N/A'}</p>`;
            if (config.content.includes('showParentContact')) parentDetails += `<p><strong>Father's Contact:</strong> ${student.parents.fatherContact || 'N/A'}</p><p><strong>Mother's Contact:</strong> ${student.parents.motherContact || 'N/A'}</p>`;
            parentInfoHtml = `<div class="section"><h2>Parent/Guardian Information</h2><div class="summary-card">${parentDetails}</div></div>`;
        }
        
        // --- Final HTML String ---
        let dynamicHtml = `
            <!DOCTYPE html><html><head><meta charset="UTF-8">
            <style>/* Styles from report-card-template.html go here */</style>
            </head><body>
                <div class="report-card">
                    <div class="header">${logoHtml}<div class="header-text"><h1>${config.schoolName}</h1><p>Academic Year ${config.academicYear}</p></div></div>
                    <div class="student-info"><div>${studentInfoHtml}</div><img src="${studentPhoto}" alt="Photo" class="student-photo"></div>
                    ${parentInfoHtml}
                    <div class="section"><h2>Academic Performance</h2><table><thead>${marksTableHeader}</thead><tbody>${marksTableBody}</tbody></table></div>
        `;
        if (config.content.includes('attendance')) dynamicHtml += `<div class="section"><h2>Attendance Summary</h2><div class="summary-card"><p><strong>Overall Attendance:</strong> ${attendancePercentage}%</p></div></div>`;
        if (config.content.includes('observations')) dynamicHtml += `<div class="section"><h2>Teacher's Observations</h2><div class="summary-card"><p>${student.teacherObservation || 'N/A'}</p></div></div>`;
        if (config.content.includes('signature')) dynamicHtml += `<div class="section" style="margin-top: 50px;"><h2>Parent/Guardian Signature</h2><div class="summary-card"><div class="signature-line">Signature</div></div></div>`;
        dynamicHtml += `</div></body></html>`;

        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        await page.setContent(dynamicHtml, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-card-${student.name.replace(/\s+/g, '-')}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating report card:', error);
        res.status(500).send('Could not generate report card.');
    }
};

module.exports = { 
    generateReportCard,
    saveReportConfig
};