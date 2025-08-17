document.addEventListener('DOMContentLoaded', () => {
    const configForm = document.getElementById('design-config-form');
    const statusMessage = document.getElementById('config-status');
    const previewFrame = document.getElementById('preview-frame');
    const logoInput = document.getElementById('school-logo');
    const logoPreview = document.getElementById('logo-preview');

    // Show a small preview of the logo when selected
    logoInput.addEventListener('change', () => {
        if (logoInput.files && logoInput.files[0]) {
            const logoUrl = URL.createObjectURL(logoInput.files[0]);
            logoPreview.src = logoUrl;
            logoPreview.style.display = 'block';
            updatePreview(); // Update the main iframe preview as well
        }
    });

    // --- FUNCTION TO GATHER ALL FORM DATA ---
    const getCurrentConfig = () => {
        const gradingScale = [
            { grade: 'A+', min: document.getElementById('grade-aplus').value },
            { grade: 'A', min: document.getElementById('grade-a').value },
            { grade: 'B', min: document.getElementById('grade-b').value },
            { grade: 'C', min: document.getElementById('grade-c').value },
            { grade: 'D', min: document.getElementById('grade-d').value },
        ];
        return {
            schoolName: document.getElementById('school-name').value,
            academicYear: document.getElementById('academic-year').value,
            theme: document.querySelector('input[name="theme"]:checked').value,
            font: document.querySelector('input[name="font"]:checked').value,
            content: Array.from(document.querySelectorAll('input[name="content"]:checked')).map(cb => cb.value),
            gradingScale: gradingScale
        };
    };

    // --- FUNCTION TO UPDATE THE LIVE PREVIEW ---
    const updatePreview = () => {
        const config = getCurrentConfig();
        const previewHtml = generatePreviewHtml(config);
        previewFrame.srcdoc = previewHtml;
    };

    // --- THIS FUNCTION IS NOW UPDATED TO BE AN EXACT CLONE OF THE BACKEND'S HTML GENERATOR ---
    const generatePreviewHtml = (config) => {
        // Dummy data for the preview
        const student = {
            name: 'Amelia Woods', className: 'Grade 5 - Section A', dob: '15/07/2014',
            address: '123 Meadow Lane, Sunnyville',
            parents: { father: 'Daniel Woods', mother: 'Sophia Woods', f_contact: '555-0101', m_contact: '555-0102' },
            attendance: '98%', observations: 'Amelia shows great enthusiasm in class and excels in creative writing.',
            marks: [
                { subject: 'English', assignment: 'Mid-Term Exam', score: '88/100', percentage: 88 },
                { subject: 'Science', assignment: 'Project Genesis', score: '95/100', percentage: 95 },
                { subject: 'Mathematics', assignment: 'Algebra Test', score: '92/100', percentage: 92 },
            ]
        };

        // Theme and font selection
        const themeColors = {
            blue: { primary: '#3B82F6', secondary: '#F0F5FF', text: '#1E2A38' },
            green: { primary: '#16A34A', secondary: '#F0FFF4', text: '#14532D' },
            grey: { primary: '#6B7280', secondary: '#F3F4F6', text: '#111827' }
        };
        const selectedTheme = themeColors[config.theme] || themeColors.blue;
        const selectedFont = config.font === 'serif' ? '"Times New Roman", Times, serif' : '"Segoe UI", sans-serif';

        const calculateGrade = (percentage, gradingScale) => {
            const sortedScale = gradingScale.sort((a, b) => b.min - a.min);
            for (const scale of sortedScale) { if (percentage >= scale.min) return scale.grade; }
            return 'F';
        };

        // Dynamically build content based on config
        let marksTableHeader = '<tr><th>Subject</th><th>Assignment</th><th>Score</th>';
        if (config.content.includes('showPercentage')) marksTableHeader += '<th>Percentage</th>';
        if (config.content.includes('showGrade')) marksTableHeader += '<th>Grade</th>';
        marksTableHeader += '</tr>';

        const marksTableBody = student.marks.map(mark => {
            let row = `<tr><td>${mark.subject}</td><td>${mark.assignment}</td><td>${mark.score}</td>`;
            if (config.content.includes('showPercentage')) row += `<td>${mark.percentage}%</td>`;
            if (config.content.includes('showGrade')) row += `<td>${calculateGrade(mark.percentage, config.gradingScale)}</td>`;
            row += '</tr>';
            return row;
        }).join('');

        let studentInfoHtml = `<p><strong>Student Name:</strong> ${student.name}</p><p><strong>Class:</strong> ${student.className}</p>`;
        if (config.content.includes('showDob')) studentInfoHtml += `<p><strong>Date of Birth:</strong> ${student.dob}</p>`;
        if (config.content.includes('showAddress')) studentInfoHtml += `<p><strong>Address:</strong> ${student.address}</p>`;
        
        let parentInfoHtml = '';
        if (config.content.includes('showParentInfo') || config.content.includes('showParentContact')) {
            let details = '';
            if (config.content.includes('showParentInfo')) details += `<p><strong>Father's Name:</strong> ${student.parents.father}</p><p><strong>Mother's Name:</strong> ${student.parents.mother}</p>`;
            if (config.content.includes('showParentContact')) details += `<p><strong>Father's Contact:</strong> ${student.parents.f_contact}</p><p><strong>Mother's Contact:</strong> ${student.parents.m_contact}</p>`;
            parentInfoHtml = `<div class="section"><h2>Parent/Guardian Information</h2><div class="summary-card">${details}</div></div>`;
        }

        // --- Assemble Final HTML, now matching the backend's styles exactly ---
        return `
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
                    <div class="header">
                        ${logoInput.files[0] ? `<img src="${URL.createObjectURL(logoInput.files[0])}" class="school-logo">` : ''}
                        <div class="header-text"><h1>${config.schoolName || 'School Name'}</h1><p>Academic Year ${config.academicYear || '20XX-20XX'}</p></div>
                    </div>
                    <div class="student-info"><div>${studentInfoHtml}</div><img src="" alt="Photo" class="student-photo"></div>
                    ${parentInfoHtml}
                    <div class="section"><h2>Academic Performance</h2><table><thead>${marksTableHeader}</thead><tbody>${marksTableBody}</tbody></table></div>
                    ${config.content.includes('attendance') ? `<div class="section"><h2>Attendance Summary</h2><div class="summary-card"><p><strong>Overall Attendance:</strong> ${student.attendance}</p></div></div>` : ''}
                    ${config.content.includes('observations') ? `<div class="section"><h2>Teacher's Observations</h2><div class="summary-card"><p>${student.observations}</p></div></div>` : ''}
                    ${config.content.includes('signature') ? `<div class="section" style="margin-top: 50px;"><h2>Parent/Guardian Signature</h2><div class="summary-card"><div class="signature-line">Signature</div></div></div>` : ''}
                </div>
            </body></html>
        `;
    };
    
    // --- EVENT LISTENERS ---
    configForm.addEventListener('change', updatePreview);
    configForm.addEventListener('input', (e) => {
        if (e.target.type === 'text' || e.target.type === 'number') {
            updatePreview();
        }
    });

    configForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        statusMessage.textContent = 'Saving...';
        const formData = new FormData();
        formData.append('configData', JSON.stringify(getCurrentConfig()));
        if (logoInput.files[0]) {
            formData.append('schoolLogo', logoInput.files[0]);
        }
        try {
            const response = await fetch('http://localhost:5000/api/reports/save-config', { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message);
            statusMessage.style.color = 'var(--success)';
            statusMessage.textContent = 'Design saved successfully!';
        } catch (error) {
            statusMessage.style.color = 'var(--danger)';
            statusMessage.textContent = `Error: ${error.message}`;
        }
    });

    // Initial preview render on page load
    updatePreview();
});