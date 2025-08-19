// In marks.js
// --- DOM Elements ---
const classSelect = document.getElementById('marks-class-select');
const assignmentCreator = document.querySelector('.assignment-creator');
const assignmentList = document.getElementById('assignment-list');
const gradebookContainer = document.getElementById('gradebook-container');
const assignmentForm = document.getElementById('assignment-form');
const savedAssignmentsHeader = document.querySelector('#assignment-list-header');

// NEW elements for the subject marks section
const subjectMarksSection = document.getElementById('subject-marks-section');
const subjectMarksSelect = document.getElementById('subject-marks-select');
const subjectGradebookContainer = document.getElementById('subject-gradebook-container');

// --- State Variable ---
let currentClassId = null;

// --- API & Display Functions ---

const populateClassroomDropdown = async () => {
    try {
        const response = await fetch('/api/classrooms');
        if (!response.ok) throw new Error('Failed to fetch classrooms');
        const classrooms = await response.json();
        
        classSelect.innerHTML = '<option value=""> Select a Class </option>';
        classrooms.forEach(classroom => {
            const option = document.createElement('option');
            option.value = classroom._id;
            option.textContent = classroom.name;
            classSelect.appendChild(option);
        });
    } catch (error) { console.error('Error:', error); }
};

// NEW: Function to populate the new subject dropdown
const populateSubjectMarksDropdown = async () => {
    try {
        const response = await fetch('/api/subjects');
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const subjects = await response.json();
        
        subjectMarksSelect.innerHTML = '<option value=""> Select a Subject</option>';
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.name;
            option.textContent = subject.name;
            subjectMarksSelect.appendChild(option);
        });
    } catch (error) { console.error('Error:', error); }
};

const displayAssignments = (assignments) => {
  assignmentList.innerHTML = '';
  if (assignments.length === 0) {
    assignmentList.innerHTML = '<p>No assignments created yet for this class.</p>';
    return;
  }
  assignments.forEach(assignment => {
    const card = document.createElement('div');
    card.className = 'assignment-card';
    card.innerHTML = `
      <div class="assignment-info">
        <h4>${assignment.assignmentName}</h4>
        <p class="assignment-head">${assignment.subject}</p>
      </div>
      <div class="assignment-actions">
        <button class="btn btn-secondary btn-enter-marks" data-assignment='${JSON.stringify(assignment)}'>
          View / Edit Marks
        </button>
        <button class="btn btn-delete-assignment" data-assignmentid="${assignment._id}">
          Delete
        </button>
      </div>
    `;
    assignmentList.appendChild(card);
  });
};

const fetchAndDisplayAssignments = async () => {
    assignmentCreator.style.display = 'none';
    savedAssignmentsHeader.style.display = 'none';
    subjectMarksSection.style.display = 'none';
    assignmentList.innerHTML = '';
    gradebookContainer.innerHTML = '';

    if (!currentClassId) return;

    assignmentCreator.style.display = 'block';
    savedAssignmentsHeader.style.display = 'block';
    subjectMarksSection.style.display = 'block';

    try {
        const response = await fetch(`/api/assignments?classId=${currentClassId}`);
        if (!response.ok) throw new Error('Failed to fetch assignments');
        const assignments = await response.json();
        displayAssignments(assignments);
    } catch (error) { console.error('Error:', error); }
};

const createAssignment = async (assignmentData) => {
    try {
        const response = await fetch('/api/assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assignmentData),
        });
        if (!response.ok) throw new Error('Failed to create assignment');
        fetchAndDisplayAssignments();
    } catch (error) { console.error('Error:', error); }
};

const deleteAssignment = async (assignmentId) => {
    try {
        const response = await fetch(`/api/assignments/${assignmentId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete assignment');
        fetchAndDisplayAssignments();
    } catch (error) { 
        console.error('Error deleting assignment:', error);
        alert('Failed to delete assignment.');
    }
};

const saveAssignmentMarks = async (assignmentId, marks) => {
    try {
        const response = await fetch(`/api/assignments/${assignmentId}/marks`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ marks }),
        });
        if (!response.ok) throw new Error('Failed to save marks');
        
        alert('Marks saved successfully!');
        gradebookContainer.innerHTML = '';
        fetchAndDisplayAssignments();
    } catch (error) { 
        console.error('Error saving marks:', error);
        alert('An error occurred while saving marks.');
    }
};

const generateGradebook = async (assignment) => {
    gradebookContainer.innerHTML = '<p>Loading students...</p>';
    try {
        const response = await fetch(`/api/students?classId=${assignment.classroomId}`);
        if (!response.ok) throw new Error('Failed to fetch students');
        const students = await response.json();

        const marksFormHTML = `
          <h3>Entering Marks for: ${assignment.assignmentName} (${assignment.subject})</h3>
          <p><strong>Max Score: ${assignment.maxScore}</strong></p>
          <form id="marks-entry-form" data-assignmentid="${assignment._id}">
            <table class="marks-table">
              <thead> <tr> <th>Student Name</th> <th>Score</th> </tr> </thead>
              <tbody>
                ${students.map(student => {
                  const existingMark = assignment.marks.find(m => m.studentId === student._id);
                  const score = existingMark ? existingMark.score : '';
                  return `<tr>
                      <td>${student.name}</td>
                      <td>
                        <input 
                          type="number" 
                          class="score-input"
                          min="0" 
                          max="${assignment.maxScore}"
                          value="${score}"
                          data-studentid="${student._id}"
                          data-studentname="${student.name}"
                          placeholder="0 - ${assignment.maxScore}">
                      </td>
                    </tr>`;
                }).join('')}
              </tbody>
            </table>
            <button type="submit" class="btn btn-primary" style="margin-top: 20px;">Save All Marks</button>
            <button type="button" class="btn btn-secondary" id="cancel-gradebook-btn" style="margin-top: 20px; margin-left:10px;">Cancel</button>
          </form>`;
        gradebookContainer.innerHTML = marksFormHTML;
    } catch (error) { console.error('Error generating gradebook:', error); }
};

// NEW: This function handles generating the gradebook for a selected subject
const generateSubjectGradebook = async (subjectName) => {
    if (!subjectName) {
        subjectGradebookContainer.innerHTML = '';
        return;
    }

    subjectGradebookContainer.innerHTML = `
        <div class="form-group">
            <label for="subject-max-score">Max Score for ${subjectName}</label>
            <input type="number" id="subject-max-score" min="1" required>
        </div>
        <button id="load-subject-marks-btn" class="btn btn-primary" style="margin-bottom: 20px;">Load Marks</button>
        <div id="dynamic-subject-gradebook"></div>
    `;

    document.getElementById('load-subject-marks-btn').addEventListener('click', async () => {
        const maxScoreInput = document.getElementById('subject-max-score');
        const maxScore = maxScoreInput.value;
        if (!maxScore || parseInt(maxScore) <= 0) {
            alert('Please enter a valid max score.');
            return;
        }

        const dynamicGradebookDiv = document.getElementById('dynamic-subject-gradebook');
        dynamicGradebookDiv.innerHTML = '<p>Loading students...</p>';

        try {
            // Find or create the monthly grades assignment
            const assignmentsResponse = await fetch(`/api/assignments?classId=${currentClassId}`);
            const allAssignments = await assignmentsResponse.json();
            let subjectAssignment = allAssignments.find(a => a.subject === subjectName && a.assignmentName.startsWith('Monthly Grades'));

            if (!subjectAssignment) {
                const assignmentData = {
                    assignmentName: `Monthly Grades - ${subjectName}`,
                    subject: subjectName,
                    maxScore: parseInt(maxScore),
                    classroomId: currentClassId,
                };
                const createResponse = await fetch('/api/assignments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(assignmentData),
                });
                subjectAssignment = await createResponse.json();
            } else {
                // If it exists, update its max score if necessary
                if (subjectAssignment.maxScore !== parseInt(maxScore)) {
                    await fetch(`/api/assignments/${subjectAssignment._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ maxScore: parseInt(maxScore) }),
                    });
                    subjectAssignment.maxScore = parseInt(maxScore);
                }
            }
            
            // Now, get the students and generate the gradebook form
            const studentsResponse = await fetch(`/api/students?classId=${currentClassId}`);
            if (!studentsResponse.ok) throw new Error('Failed to fetch students');
            const students = await studentsResponse.json();

            dynamicGradebookDiv.innerHTML = `
                <form id="subject-marks-form" data-assignmentid="${subjectAssignment._id}">
                    <p><strong>Max Score: ${subjectAssignment.maxScore}</strong></p>
                    <table class="marks-table">
                        <thead> <tr> <th>Student Name</th> <th>Score</th> </tr> </thead>
                        <tbody>
                            ${students.map(student => {
                                const existingMark = subjectAssignment.marks.find(m => m.studentId === student._id);
                                const score = existingMark ? existingMark.score : '';
                                return `<tr>
                                    <td>${student.name}</td>
                                    <td>
                                        <input 
                                          type="number" 
                                          class="score-input"
                                          min="0" 
                                          max="${subjectAssignment.maxScore}"
                                          value="${score}"
                                          data-studentid="${student._id}"
                                          data-studentname="${student.name}"
                                          placeholder="0 - ${subjectAssignment.maxScore}">
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                    <button type="submit" class="btn btn-primary" style="margin-top: 20px;">Save Marks</button>
                    <button type="button" class="btn btn-secondary" id="cancel-subject-gradebook-btn" style="margin-top: 20px; margin-left:10px;">Cancel</button>
                </form>
            `;
        } catch (error) {
            console.error('Error loading subject gradebook:', error);
            dynamicGradebookDiv.innerHTML = `<p>Could not load gradebook for this subject. Error: ${error.message}</p>`;
        }
    });
};

// --- Event Listeners ---

classSelect.addEventListener('change', () => {
    currentClassId = classSelect.value;
    fetchAndDisplayAssignments();
    // Also, reset and populate the new subject dropdown
    subjectMarksSelect.value = '';
    populateSubjectMarksDropdown();
});

// Listener for the main assignment form
assignmentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentClassId) return alert('Please select a class first.');

    const assignmentData = {
        assignmentName: document.getElementById('assignment-name').value,
        subject: document.getElementById('subject-text').value,
        maxScore: document.getElementById('max-score').value,
        dueDate: document.getElementById('assignment-due-date').value,
        classroomId: currentClassId,
    };
    createAssignment(assignmentData);
    e.target.reset();
});

// Listener for the new subject marks dropdown
subjectMarksSelect.addEventListener('change', () => {
    if (subjectMarksSelect.value) {
        generateSubjectGradebook(subjectMarksSelect.value);
    } else {
        subjectGradebookContainer.innerHTML = ''; // Clear if nothing is selected
    }
});

// Listener for the "Save Marks" form inside the subject gradebook
subjectGradebookContainer.addEventListener('submit', async (e) => {
    if (e.target.id === 'subject-marks-form') {
        e.preventDefault();
        const assignmentId = e.target.dataset.assignmentid;
        const marksToSave = [];
        const scoreInputs = e.target.querySelectorAll('.score-input');

        scoreInputs.forEach(input => {
            if (input.value) {
                marksToSave.push({
                    studentId: input.dataset.studentid,
                    studentName: input.dataset.studentname,
                    score: parseInt(input.value, 10),
                });
            }
        });
        if (marksToSave.length > 0) {
            await saveAssignmentMarks(assignmentId, marksToSave);
            // Optionally, clear the gradebook after saving
            subjectGradebookContainer.innerHTML = '';
            subjectMarksSelect.value = '';
        }
    }
});

// Listener for the new cancel button
subjectGradebookContainer.addEventListener('click', (e) => {
    if(e.target.id === 'cancel-subject-gradebook-btn') {
        subjectGradebookContainer.innerHTML = '';
        subjectMarksSelect.value = '';
    }
});

// Main listener for the assignment list
assignmentList.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-enter-marks')) {
        const assignment = JSON.parse(e.target.dataset.assignment);
        // We will pass the data to a new function
        generateGradebook(assignment);
    }
    if (e.target.classList.contains('btn-delete-assignment')) {
        const assignmentId = e.target.dataset.assignmentid;
        if (confirm('Are you sure you want to permanently delete this assignment?')) {
            deleteAssignment(assignmentId);
        }
    }
});

// Main listener for the gradebook container
gradebookContainer.addEventListener('submit', (e) => {
    if (e.target.id === 'marks-entry-form') {
        e.preventDefault();
        const assignmentId = e.target.dataset.assignmentid;
        const marksToSave = [];
        const scoreInputs = e.target.querySelectorAll('.score-input');

        scoreInputs.forEach(input => {
            if (input.value) {
                marksToSave.push({
                    studentId: input.dataset.studentid,
                    studentName: input.dataset.studentname,
                    score: parseInt(input.value, 10),
                });
            }
        });
        if (marksToSave.length > 0) saveAssignmentMarks(assignmentId, marksToSave);
    }
});
gradebookContainer.addEventListener('click', (e) => {
    if(e.target.id === 'cancel-gradebook-btn') {
        fetchAndDisplayAssignments();
    }
});

// --- Initial Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    assignmentCreator.style.display = 'none';
    savedAssignmentsHeader.style.display = 'none';
    subjectMarksSection.style.display = 'none';

    // Populate the dropdowns on initial load
    populateClassroomDropdown();
    populateSubjectMarksDropdown();
});