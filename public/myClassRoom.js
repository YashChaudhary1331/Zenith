// Get DOM elements for the dashboard
const classroomForm = document.getElementById('classroom-form');
const classroomList = document.getElementById('classroom-list');
let allClassroomsWithStudents = []; // Will store all data

// --- Display and API Functions ---

// Renders the list of classrooms with hidden student lists
const displayClassrooms = (classrooms) => {
  classroomList.innerHTML = '';
  if (classrooms.length === 0) {
    classroomList.innerHTML = '<p>No classrooms found. Create one to get started!</p>';
    return;
  }

  classrooms.forEach(classroom => {
    const classroomCard = document.createElement('div');
    classroomCard.classList.add('classroom-card');
    // The button is now a regular button, not a link
    classroomCard.innerHTML = `
            <div class="classroom-card-header">
                <h4>${classroom.name}</h4>
                <div>
                    <button class="btn btn-secondary btn-view-class" data-classroomid="${classroom._id}">
                        View Students
                    </button>
                    <button class="btn btn-delete" data-classroomid="${classroom._id}">
                        Delete Class
                    </button>
                </div>
            </div>
            <div class="student-list-container" id="students-of-${classroom._id}" style="display: none;">
            </div>
        `;
    classroomList.appendChild(classroomCard);
  });
};

// Fetches all classrooms WITH their students
const fetchAndDisplayClassrooms = async () => {
  try {
    // We use our powerful endpoint to get all data at once
    const response = await fetch('/api/classrooms/with-students');
    if (!response.ok) throw new Error('Failed to fetch classrooms');
    allClassroomsWithStudents = await response.json();
    displayClassrooms(allClassroomsWithStudents);
  } catch (error) {
    console.error('Error:', error);
  }
};

// Creates a new classroom
const createClassroom = async (name) => {
  try {
    const response = await fetch('/api/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Failed to create classroom');
    fetchAndDisplayClassrooms(); // Refresh the list
  } catch (error) {
    console.error('Error:', error);
  }
};

const deleteClassroom = async (classroomId) => {
  if (!confirm('Are you sure you want to delete this classroom? This will also delete all associated students and data.')) {
    return;
  }
  try {
    const response = await fetch(`/api/classrooms/${classroomId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete classroom');
    fetchAndDisplayClassrooms();
  } catch (error) {
    console.error('Error deleting classroom:', error);
    alert('Failed to delete classroom. Please try again.');
  }
};

// --- Event Listeners ---

// Event listener for the create classroom form
classroomForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const classroomName = document.getElementById('classroom-name').value;
  createClassroom(classroomName);
  e.target.reset();
});

// Event listener for clicks on the classroom list (to handle "View Students" and "Delete")
classroomList.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-view-class')) {
    const classroomId = e.target.dataset.classroomid;
    const studentContainer = document.getElementById(`students-of-${classroomId}`);

    // Toggle visibility
    const isHidden = studentContainer.style.display === 'none';
    if (isHidden) {
      // Find the classroom data
      const classroom = allClassroomsWithStudents.find(c => c._id === classroomId);
      let studentsHTML = '<p>No students in this class.</p>';

      if (classroom && classroom.students.length > 0) {
        studentsHTML = `<div class="student-list-expanded">
          ${classroom.students.map(student => `
            <div class="student-entry">
              <img src="${student.photograph || './images/logo.png'}" alt="Photo" class="student-avatar">
              <div class="student-info">
                <strong>${student.name}</strong>
                <span>${student.address || 'Not specified'}</span>
              </div>
            </div>
          `).join('')}
        </div>`;
      }

      studentContainer.innerHTML = studentsHTML;
      studentContainer.style.display = 'block';
      e.target.textContent = 'Hide Students';
    } else {
      studentContainer.style.display = 'none';
      e.target.textContent = 'View Students';
    }
  } else if (e.target.classList.contains('btn-delete')) {
    const classroomId = e.target.dataset.classroomid;
    deleteClassroom(classroomId);
  }
});

// Initial fetch when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayClassrooms);