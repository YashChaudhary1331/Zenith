// In controllers/reportController.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const Student = require('../models/studentModel');
const Assignment = require('../models/assignmentModel');
const Classroom = require('../models/classroomModel');

const CONFIG_FILE_PATH = path.join(__dirname, '..', 'uploads', 'templates', 'report-config.json');

/**
 * Saves the report card design configuration from the frontend.
 * It expects multipart/form-data with a JSON string 'configData' and an optional 'schoolLogo' file.
 */
const saveReportConfig = async (req, res) => {
    try {
        // Multer puts the text field 'configData' into req.body
        const config = JSON.parse(req.body.configData);
        
        // Ensure the directory exists before writing the file
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

/**
 * Calculates a letter grade based on a percentage and a custom grading scale.
 * @param {number} percentage The student's score percentage.
 * @param {Array} gradingScale The custom scale from the config file.
 * @returns {string} The calculated letter grade.
 */
const calculateGrade = (percentage, gradingScale) => {
    // Sort the scale from highest min score to lowest
    const sortedScale = gradingScale.sort((a, b) => b.min - a.min);
    for (const scale of sortedScale) {
        if (percentage >= scale.min) return scale.grade;
    }
    return 'F';
};

/**
 * Generates the report card PDF dynamically based on the saved configuration.
 */
const generateReportCard = async (req, res) => {
    try {
        // 1. Load config or use comprehensive defaults if the file doesn't exist.
        let config = { 
            schoolName: 'Zenith School',
            academicYear: '2024-2025',
            theme: 'blue', 
            font: 'sans-serif',
            content: ['showDob', 'showAddress', 'showParentInfo', 'showPercentage', 'showGrade', 'attendance', 'observations'],
            gradingScale: [
                { grade: 'A+', min: '90' }, { grade: 'A', min: '80' }, { grade: 'B', min: '70' },
                { grade: 'C', min: '60' }, { grade: 'D', min: '50' }
            ]
        };
        if (fs.existsSync(CONFIG_FILE_PATH)) {
            config = JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf8'));
        }

        // 2. Fetch all necessary data for the student
        const student = await Student.findById(req.params.studentId);
        if (!student) return res.status(404).send('Student not found.');
        
        const classroom = await Classroom.findById(student.classroomId);
        const assignments = await Assignment.find({ 'marks.studentId': student._id });
        const attendancePercentage = student.attendance.length > 0 ? ((student.attendance.filter(a => a.status !== 'Absent').length / student.attendance.length) * 100).toFixed(0) : 'N/A';
        
        // 3. Dynamically build the HTML, CSS, and content based on the loaded config
        const themeColors = {
            blue: { primary: '#3B82F6', secondary: '#F0F5FF', text: '#1E2A38' },
            green: { primary: '#16A34A', secondary: '#F0FFF4', text: '#14532D' },
            grey: { primary: '#6B7280', secondary: '#F3F4F6', text: '#111827' }
        };
        const selectedTheme = themeColors[config.theme] || themeColors.blue;
        const selectedFont = config.font === 'serif' ? '"Times New Roman", Times, serif' : '"Segoe UI", sans-serif';

        // --- Dynamic Content Preparation ---

        // School Logo
        let logoHtml = '';
        const logoDir = path.join(__dirname, '..', 'uploads', 'templates');
        const logoFile = fs.readdirSync(logoDir).find(f => f.startsWith('school-logo'));
        if (logoFile) {
            const logoPath = path.join(logoDir, logoFile);
            const logoBase64 = fs.readFileSync(logoPath, 'base64');
            const logoMime = `image/${path.extname(logoFile).slice(1)}`;
            logoHtml = `<img src="data:${logoMime};base64,${logoBase64}" class="school-logo">`;
        }
        
        // Marks Table Header
        let marksTableHeader = '<tr><th>Subject</th><th>Assignment</th><th>Score</th>';
        if (config.content.includes('showPercentage')) marksTableHeader += '<th>Percentage</th>';
        if (config.content.includes('showGrade')) marksTableHeader += '<th>Grade</th>';
        marksTableHeader += '</tr>';

        // Marks Table Body
        const marksTableBody = assignments.map(a => {
            const mark = a.marks.find(m => m.studentId.equals(student._id));
            const percentage = ((mark.score / a.maxScore) * 100);
            let row = `<tr><td>${a.subject}</td><td>${a.assignmentName}</td><td>${mark.score}/${a.maxScore}</td>`;
            if (config.content.includes('showPercentage')) row += `<td>${percentage.toFixed(0)}%</td>`;
            if (config.content.includes('showGrade')) row += `<td>${calculateGrade(percentage, config.gradingScale)}</td>`;
            row += '</tr>';
            return row;
        }).join('');

        // Student Info Block
        let studentInfoHtml = `<p><strong>Student Name:</strong> ${student.name}</p><p><strong>Class:</strong> ${classroom.name}</p>`;
        if (config.content.includes('showDob')) studentInfoHtml += `<p><strong>Date of Birth:</strong> ${new Date(student.dateOfBirth).toLocaleDateString()}</p>`;
        if (config.content.includes('showAddress')) studentInfoHtml += `<p><strong>Address:</strong> ${student.address || 'N/A'}</p>`;
        
        // Parent Info Section
        let parentInfoHtml = '';
        if (config.content.includes('showParentInfo') || config.content.includes('showParentContact')) {
            let parentDetails = '';
            if (config.content.includes('showParentInfo')) {
                parentDetails += `<p><strong>Father's Name:</strong> ${student.parents.fatherName || 'N/A'}</p><p><strong>Mother's Name:</strong> ${student.parents.motherName || 'N/A'}</p>`;
            }
            if (config.content.includes('showParentContact')) {
                 parentDetails += `<p><strong>Father's Contact:</strong> ${student.parents.fatherContact || 'N/A'}</p><p><strong>Mother's Contact:</strong> ${student.parents.motherContact || 'N/A'}</p>`;
            }
            parentInfoHtml = `<div class="section"><h2>Parent/Guardian Information</h2><div class="summary-card">${parentDetails}</div></div>`;
        }

        // Student Photo
        let studentPhoto = '';
        if (student.photograph && fs.existsSync(path.join(__dirname, '..', student.photograph))) {
            const imageAsBase64 = fs.readFileSync(path.join(__dirname, '..', student.photograph), 'base64');
            studentPhoto = `data:image/${path.extname(student.photograph).slice(1)};base64,${imageAsBase64}`;
        }

        // --- Assemble Final HTML String ---
        let dynamicHtml = `
            <!DOCTYPE html><html><head><meta charset="UTF-8">
                <style>
                    body { font-family: ${selectedFont}; font-size: 12px; color: #333; }
                    .report-card { width: 800px; margin: auto; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.1); padding: 30px; }
                    .header { display: flex; align-items: center; justify-content: center; text-align: center; border-bottom: 2px solid ${selectedTheme.primary}; padding-bottom: 10px; margin-bottom: 20px; }
                    .header-text { flex-grow: 1; } .header h1 { margin: 0; color: ${selectedTheme.text}; }
                    .school-logo { max-height: 70px; max-width: 150px; margin-right: 20px; }
                    .student-info { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
                    .student-photo { border-radius: 50%; width: 100px; height: 100px; object-fit: cover; border: 3px solid ${selectedTheme.primary}; }
                    .section h2 { background-color: ${selectedTheme.secondary}; color: ${selectedTheme.primary}; padding: 8px; margin: 0 0 15px 0; border-radius: 4px; font-size: 16px; }
                    table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: ${selectedTheme.secondary}; } .summary-card { background: ${selectedTheme.secondary}; border: 1px solid #ddd; padding: 15px; border-radius: 8px; min-height: 50px;}
                    .signature-line { border-top: 1px solid #333; margin-top: 10px; padding-top: 5px; width: 250px; text-align: center; font-size: 10px; }
                </style>
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

        // 4. Generate and Send PDF
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