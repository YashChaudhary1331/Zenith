// --- DOM Elements ---
const classSelect = document.getElementById('attendance-class-select');
const dateInput = document.getElementById('attendance-date');
const attendanceContainer = document.getElementById('attendance-list-container');

// --- Functions ---
const populateClassroomDropdown = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/classrooms');
        if (!response.ok) throw new Error('Failed to fetch classrooms');
        const classrooms = await response.json();
        classSelect.innerHTML = '<option value="">-- Select a Class --</option>';
        classrooms.forEach(c => {
            const option = document.createElement('option');
            option.value = c._id;
            option.textContent = c.name;
            classSelect.appendChild(option);
        });
    } catch (error) { console.error('Error:', error); }
};

// In attendance.js, replace the entire function with this one
const generateAttendanceList = async () => {
    const classId = classSelect.value;
    const date = dateInput.value;
    if (!classId || !date) {
        attendanceContainer.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/students?classId=${classId}`);
        if (!response.ok) throw new Error('Failed to fetch students');
        const students = await response.json();

        if (students.length === 0) {
            attendanceContainer.innerHTML = '<p>There are no students in this class. Please add students via the "Students" page first.</p>';
            return;
        }

        const listHTML = `
            <table class="attendance-table">
                <thead><tr><th>Student Name</th><th>Status</th></tr></thead>
                <tbody>
                    ${students.map(student => {
                        // THIS IS THE LINE WE ARE FIXING
                        const attendanceRecord = (student.attendance || []).find(att => new Date(att.date).toDateString() === new Date(date).toDateString());
                        const status = attendanceRecord ? attendanceRecord.status : 'Present'; // Default to Present
                        return `
                            <tr data-studentid="${student._id}">
                                <td>${student.name}</td>
                                <td class="attendance-status-buttons" data-status="${status}">
                                    <button class="btn-present ${status === 'Present' ? 'active' : ''}" data-status="Present">Present</button>
                                    <button class="btn-absent ${status === 'Absent' ? 'active' : ''}" data-status="Absent">Absent</button>
                                    <button class="btn-late ${status === 'Late' ? 'active' : ''}" data-status="Late">Late</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <button id="save-attendance-btn" class="btn btn-primary" style="margin-top: 20px;">Save Attendance</button>
        `;
        attendanceContainer.innerHTML = listHTML;
    } catch (error) {
        console.error('Error:', error);
        attendanceContainer.innerHTML = '<p>Could not load students. Please check the console for errors.</p>';
    }
};

const saveAttendance = async () => {
    const date = dateInput.value;
    const recordsToSave = [];
    const rows = document.querySelectorAll('.attendance-table tbody tr');

    rows.forEach(row => {
        recordsToSave.push({
            studentId: row.dataset.studentid,
            date: date,
            status: row.querySelector('.attendance-status-buttons').dataset.status,
        });
    });

    try {
        const response = await fetch('http://localhost:5000/api/attendance/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(recordsToSave),
        });
        if (!response.ok) throw new Error('Failed to save attendance');
        alert('Attendance saved successfully!');
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save attendance.');
    }
};

// --- Event Listeners ---
classSelect.addEventListener('change', generateAttendanceList);
dateInput.addEventListener('change', generateAttendanceList);

attendanceContainer.addEventListener('click', (e) => {
    // Handle clicks on the P/A/L buttons
    if (e.target.tagName === 'BUTTON' && e.target.dataset.status) {
        const buttonsContainer = e.target.parentElement;
        // Remove active class from all buttons in the same group
        buttonsContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
        // Add active class to the clicked button
        e.target.classList.add('active');
        // Store the selected status on the parent element
        buttonsContainer.dataset.status = e.target.dataset.status;
    }
    // Handle click on the save button
    if (e.target.id === 'save-attendance-btn') {
        saveAttendance();
    }
});

// --- Initial Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    populateClassroomDropdown();
});