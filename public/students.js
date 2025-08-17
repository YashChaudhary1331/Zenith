// In students.js

const availableBadges = [
    { id: 'perfectAttendance', name: 'Perfect Attendance', icon: '✅', color: '#34D399' },
    { id: 'risingStar', name: 'Rising Star', icon: '⭐', color: '#FBBF24' },
    { id: 'creativeThinker', name: 'Creative Thinker', icon: '💡', color: '#9b59b6' },
    { id: 'teamPlayer', name: 'Team Player', icon: '🤝', color: '#4A90E2' },
    { id: 'eagerLearner', name: 'Eager Learner', icon: '📚', color: '#f368e0' }
];

// --- Global Variables & DOM Elements ---

let allClassrooms = [];
const mainContent = document.querySelector('.main-content');
const addStudentBtn = document.getElementById('add-student-btn');

// Add Student Modal
const addStudentModal = document.getElementById('add-student-modal');
const addStudentForm = document.getElementById('add-student-form');
const addClassroomSelect = document.getElementById('classroom-select');
const cancelBtn = document.getElementById('cancel-btn');

// Edit Student Modal
const editModal = document.getElementById('edit-student-modal');
const editStudentForm = document.getElementById('edit-student-form');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
let currentStudentId = null;

// Access Codes Modal
const accessModal = document.getElementById('access-codes-modal');
const accessModalTitle = document.getElementById('access-modal-title');
const studentCodeDisplay = document.getElementById('student-code-display');
const parentCodeDisplay = document.getElementById('parent-code-display');
const generateCodesBtn = document.getElementById('generate-codes-btn');
const closeAccessModalBtn = document.getElementById('close-access-modal-btn');
const copyStudentCodeBtn = document.getElementById('copy-student-code-btn');
const copyParentCodeBtn = document.getElementById('copy-parent-code-btn');
let studentIdForAccess = null;

// AI Observation Modal
const aiModal = document.getElementById('ai-observation-modal');
const aiModalTitle = document.getElementById('ai-modal-title');
const aiTextarea = document.getElementById('ai-observation-textarea');
const generateObservationBtn = document.getElementById('generate-observation-btn');
const copyObservationBtn = document.getElementById('copy-observation-btn');
const closeAiModalBtn = document.getElementById('close-ai-modal-btn');
const spinnerContainer = aiModal.querySelector('.spinner-container');
let studentIdForAI = null;

// --- FIX: Messaging Modal elements are now declared here with the others ---
const messageModal = document.getElementById('message-modal');
const messageModalTitle = document.getElementById('message-modal-title');
const messageDisplayArea = document.getElementById('message-display-area');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const closeMessageModalBtn = document.getElementById('close-message-modal-btn');
let currentConversationStudentId = null;


// --- Helper & Display Functions ---

const findStudentById = (studentId) => {
    for (const classroom of allClassrooms) {
        const student = classroom.students.find(s => s._id === studentId);
        if (student) return student;
    }
    return null;
};

const displayGroupedStudents = (classrooms) => {
    let studentListContainer = document.getElementById('student-list-grouped');
    if (!studentListContainer) {
        studentListContainer = document.createElement('div');
        studentListContainer.id = 'student-list-grouped';
        mainContent.appendChild(studentListContainer);
    }
    studentListContainer.innerHTML = '';

    if (classrooms.every(c => c.students.length === 0)) {
        studentListContainer.innerHTML = '<p>No students found. Add one to get started!</p>';
        return;
    }

  classrooms.forEach(classroom => {
        if (classroom.students && classroom.students.length > 0) {
            const classroomSectionHTML = `
                <div class="classroom-group">
                    <h2 class="classroom-heading">${classroom.name}</h2>
                    <div class="student-list">
                    ${classroom.students.map(student => {
                        const badgesHTML = (student.badges && student.badges.length > 0) ? `
                            <div class="badge-list">
                                ${student.badges.map(badgeId => {
                                    const badge = availableBadges.find(b => b.id === badgeId);
                                    return badge ? `<span class="badge" style="background-color: ${badge.color};">${badge.icon} ${badge.name}</span>` : '';
                                }).join('')}
                            </div>
                        ` : '';
                        
                        return `
                        <div class="student-card">
                            <img src="${student.photograph || './images/logo.png'}" alt="Profile Photo" class="student-photo">
                            <div class="student-card-details">
                                <h3>${student.name}</h3>
                                ${badgesHTML} 
                                <p style="margin-top: 10px;">${student.address || 'Not available'}</p>
                                <div class="parent-info">
                                    <p><strong>Father:</strong> <span>${student.parents?.fatherName || 'N/A'}</span></p>
                                    <p><strong>Mother:</strong> <span>${student.parents?.motherName || 'N/A'}</span></p>
                                </div>
                                <div class="card-actions">
                                    <p>Created: ${new Date(student.createdAt).toLocaleDateString()}</p>
                                    <div>
                                        <button class="btn-messages" data-id="${student._id}">Messages</button>
                                        <button class="btn-generate-report" data-id="${student._id}">Report</button>
                                        
                                        <button class="btn-manage-access" data-id="${student._id}">Access</button>
                                        <button class="btn-edit" data-id="${student._id}">Edit</button>
                                        <button class="btn-delete" data-id="${student._id}">Delete</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                    </div>
                </div>
                <hr class="class-end-hr">
            `;
            studentListContainer.innerHTML += classroomSectionHTML;
        }
    });
};

const renderMessages = (messages) => {
    messageDisplayArea.innerHTML = messages.map(msg => `
        <div class="message ${msg.senderRole === 'teacher' ? 'sent' : 'received'}">
            <p>${msg.messageText}</p>
            <span class="timestamp">${new Date(msg.createdAt).toLocaleString()}</span>
        </div>
    `).join('');
    messageDisplayArea.scrollTop = messageDisplayArea.scrollHeight;
};


// --- API Functions ---
const fetchAndDisplayGroupedStudents = async () => {
    try {
        const response = await fetch('/api/classrooms/with-students');
        if (!response.ok) throw new Error('Failed to fetch data');
        allClassrooms = await response.json();
        displayGroupedStudents(allClassrooms);
    } catch (error) { console.error('Error:', error); }
};

const populateClassroomDropdown = async () => {
    try {
        const response = await fetch('/api/classrooms');
        if (!response.ok) throw new Error('Failed to fetch classrooms');
        const classrooms = await response.json();
        addClassroomSelect.innerHTML = '<option value="">Select a classroom...</option>';
        classrooms.forEach(classroom => {
            const option = document.createElement('option');
            option.value = classroom._id;
            option.textContent = classroom.name;
            addClassroomSelect.appendChild(option);
        });
    } catch (error) { console.error('Error:', error); }
};

const addStudent = async (formData) => {
    try {
        const response = await fetch('/api/students', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Failed to create student');
        closeAddModal();
        fetchAndDisplayGroupedStudents();
    } catch (error) { console.error('Error adding student:', error); }
};

const updateStudent = async (id, formData) => {
    try {
        const response = await fetch(`/api/students/${id}`, { method: 'PUT', body: formData });
        if (!response.ok) throw new Error('Failed to update student');
        closeEditModal();
        fetchAndDisplayGroupedStudents();
    } catch (error) { console.error('Error updating student:', error); }
};

const deleteStudent = async (id) => {
    try {
        const response = await fetch(`/api/students/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete student');
        fetchAndDisplayGroupedStudents();
    } catch (error) { console.error('Error deleting student:', error); }
};

// --- Modal Opening/Closing Functions ---
const openAddModal = () => addStudentModal.style.display = 'flex';
const closeAddModal = () => { addStudentForm.reset(); addStudentModal.style.display = 'none'; };

const openEditModal = (student) => {
    currentStudentId = student._id;
    document.getElementById('edit-name').value = student.name;
    document.getElementById('edit-address').value = student.address || '';
    document.getElementById('edit-date-of-birth').value = student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '';
    document.getElementById('edit-father-name').value = student.parents?.fatherName || '';
    document.getElementById('edit-father-contact').value = student.parents?.fatherContact || '';
    document.getElementById('edit-mother-name').value = student.parents?.motherName || '';
    document.getElementById('edit-mother-contact').value = student.parents?.motherContact || '';
    document.getElementById('edit-teacher-observation').value = student.teacherObservation || '';
    const badgeContainer = document.getElementById('badge-checklist-container');
    badgeContainer.innerHTML = '';
    availableBadges.forEach(badge => {
        const isChecked = student.badges && student.badges.includes(badge.id);
        const checkboxHTML = `<label class="checkbox-label"><input type="checkbox" name="badges" value="${badge.id}" ${isChecked ? 'checked' : ''}> ${badge.icon} ${badge.name}</label>`;
        badgeContainer.innerHTML += checkboxHTML;
    });
    editModal.style.display = 'flex';
};
const closeEditModal = () => editModal.style.display = 'none';

const openAccessModal = (student) => {
    studentIdForAccess = student._id;
    accessModalTitle.textContent = `Access Codes for ${student.name}`;
    studentCodeDisplay.textContent = student.studentAccessCode || 'Not generated yet.';
    parentCodeDisplay.textContent = student.parentAccessCode || 'Not generated yet.';
    generateCodesBtn.style.display = student.studentAccessCode ? 'none' : 'block';
    accessModal.style.display = 'flex';
};
const closeAccessModal = () => accessModal.style.display = 'none';

const openMessageModal = async (student) => {
    currentConversationStudentId = student._id;
    messageModalTitle.textContent = `Conversation with ${student.name}'s Parents`;
    messageModal.style.display = 'flex';
    messageDisplayArea.innerHTML = "<p>Loading messages...</p>";
    
    try {
        const response = await fetch(`/api/messages/${student._id}`);
        const messages = await response.json();
        renderMessages(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        messageDisplayArea.innerHTML = "<p>Could not load messages.</p>";
    }
};
const closeMessageModal = () => {
    messageModal.style.display = 'none';
    messageInput.value = '';
    currentConversationStudentId = null;
};


// --- The Main Function to Set Up All Event Listeners ---
const setupEventListeners = () => {
    
    // Listen for clicks on the main "Add Student" button
    addStudentBtn.addEventListener('click', openAddModal);

    // Listeners for the "Add Student" modal
    cancelBtn.addEventListener('click', closeAddModal);
    addStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(addStudentForm);
        const parents = {
            fatherName: document.getElementById('father-name').value,
            motherName: document.getElementById('mother-name').value,
            fatherContact: document.getElementById('father-contact').value,
            motherContact: document.getElementById('mother-contact').value,
        };
        formData.set('parents', JSON.stringify(parents));
        addStudent(formData);
    });

    // Listeners for the "Edit Student" modal
    cancelEditBtn.addEventListener('click', closeEditModal);
    editStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(editStudentForm);
        const parents = {
            fatherName: document.getElementById('edit-father-name').value,
            motherName: document.getElementById('edit-mother-name').value,
            fatherContact: document.getElementById('edit-father-contact').value,
            motherContact: document.getElementById('edit-mother-contact').value,
        };
        formData.set('parents', JSON.stringify(parents));
        const selectedBadges = Array.from(document.querySelectorAll('#badge-checklist-container input:checked')).map(cb => cb.value);
        formData.set('badges', JSON.stringify(selectedBadges));
        updateStudent(currentStudentId, formData);
    });

    // --- FIX: All card button clicks are handled by this single, consolidated listener ---
    mainContent.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const studentId = button.dataset.id;
        if (!studentId) return;

        if (button.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to delete this student?')) deleteStudent(studentId);
        } else if (button.classList.contains('btn-edit')) {
            const student = findStudentById(studentId);
            if (student) openEditModal(student);
        } else if (button.classList.contains('btn-manage-access')) {
            const student = findStudentById(studentId);
            if (student) openAccessModal(student);
        } else if (button.classList.contains('btn-generate-report')) {
            window.open(`/api/reports/report-card/${studentId}`, '_blank');
        } else if (button.classList.contains('btn-messages')) { // Logic for messages now here
            const student = findStudentById(studentId);
            if (student) openMessageModal(student);
        }
    });

    // Listeners for the "Access Codes" modal
    closeAccessModalBtn.addEventListener('click', closeAccessModal);
    copyStudentCodeBtn.addEventListener('click', () => navigator.clipboard.writeText(studentCodeDisplay.textContent));
    copyParentCodeBtn.addEventListener('click', () => navigator.clipboard.writeText(parentCodeDisplay.textContent));
    generateCodesBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`/api/students/${studentIdForAccess}/generate-codes`, { method: 'POST' });
            if (!response.ok) throw new Error('Failed to generate codes');
            const newCodes = await response.json();
            const student = findStudentById(studentIdForAccess);
            if (student) {
                student.studentAccessCode = newCodes.studentAccessCode;
                student.parentAccessCode = newCodes.parentAccessCode;
                openAccessModal(student);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not generate codes.');
        }
    });
    
    // --- FIX: Event listeners for the message modal are now here ---
    closeMessageModalBtn.addEventListener('click', closeMessageModal);
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const messageText = messageInput.value.trim();
        if (!messageText || !currentConversationStudentId) return;

        try {
            const response = await fetch(`/api/messages/${currentConversationStudentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageText }),
            });
            if (!response.ok) throw new Error('Failed to send message');
            
            messageInput.value = '';
            const student = findStudentById(currentConversationStudentId);
            if (student) openMessageModal(student);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });
};

// --- Initial Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayGroupedStudents();
    populateClassroomDropdown();
    setupEventListeners(); // This one function sets up everything
});