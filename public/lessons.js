document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const classSelect = document.getElementById('lesson-class-select');
    const addLessonBtn = document.getElementById('add-lesson-btn');
    const lessonListContainer = document.getElementById('lesson-list');
    
    // Main Lesson Modal
    const lessonModal = document.getElementById('lesson-modal');
    const lessonModalTitle = document.getElementById('lesson-modal-title');
    const lessonForm = document.getElementById('lesson-form');
    const cancelLessonBtn = document.getElementById('cancel-lesson-btn');
    const attachResourcesBtn = document.getElementById('attach-resources-btn');

    // Resource Picker Modal
    const resourcePickerModal = document.getElementById('resource-picker-modal');
    const resourceChecklist = document.getElementById('resource-checklist');
    const cancelPickerBtn = document.getElementById('cancel-picker-btn');
    const confirmPickerBtn = document.getElementById('confirm-picker-btn');

    let currentClassId = null;
    let currentLinkedResources = [];

    // --- HELPER & API FUNCTIONS (Defined first) ---
    const populateClassroomDropdown = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/classrooms');
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

    const fetchLessons = async () => {
        if (!currentClassId) {
            lessonListContainer.innerHTML = '<p>Please select a class to view lesson plans.</p>';
            return;
        }
        try {
            const response = await fetch(`http://localhost:5000/api/lessons?classId=${currentClassId}`);
            const lessons = await response.json();
            displayLessons(lessons);
        } catch (error) { console.error('Error fetching lessons:', error); }
    };

    const saveLesson = async (lessonData) => {
        const isUpdating = !!lessonData.id;
        const url = isUpdating ? `http://localhost:5000/api/lessons/${lessonData.id}` : 'http://localhost:5000/api/lessons';
        const method = isUpdating ? 'PUT' : 'POST';
        lessonData.linkedResources = currentLinkedResources;
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lessonData),
            });
            if (!response.ok) throw new Error('Failed to save lesson');
            closeLessonModal();
            fetchLessons();
        } catch (error) { console.error('Error saving lesson:', error); }
    };

    const deleteLesson = async (id) => {
        if (!confirm('Are you sure you want to delete this lesson plan?')) return;
        try {
            await fetch(`http://localhost:5000/api/lessons/${id}`, { method: 'DELETE' });
            fetchLessons();
        } catch (error) { console.error('Error deleting lesson:', error); }
    };

    // --- DISPLAY & MODAL FUNCTIONS ---
    const displayLessons = (lessons) => {
        lessonListContainer.innerHTML = '';
        if (lessons.length === 0) {
            lessonListContainer.innerHTML = '<p>No lesson plans created for this class yet.</p>';
            return;
        }
        lessons.forEach(lesson => {
            const card = document.createElement('div');
            card.className = 'lesson-card';
            const resourcesHTML = lesson.linkedResources.length > 0 ? `
                <div class="linked-resources-list">
                    <strong>Attached Resources:</strong>
                    <ul>
                        ${lesson.linkedResources.map(res => `
                            <li>
                                <a href="${res.type === 'file' ? `http://localhost:5000${res.filePath}` : res.url}" target="_blank">
                                    ${res.title}
                                </a>
                            </li>`).join('')}
                    </ul>
                </div>` : '';
            card.innerHTML = `
                <div class="lesson-card-info">
                    <h3>${lesson.title}</h3>
                    <p><strong>Subject:</strong> ${lesson.subject || 'N/A'}</p>
                    <p><strong>Dates:</strong> ${new Date(lesson.startDate).toLocaleDateString()} - ${lesson.endDate ? new Date(lesson.endDate).toLocaleDateString() : 'Ongoing'}</p>
                    ${resourcesHTML}
                </div>
                <div class="lesson-card-actions">
                    <button class="btn-edit" data-id='${lesson._id}'>Edit</button>
                    <button class="btn-delete" data-id='${lesson._id}'>Delete</button>
                </div>
            `;
            lessonListContainer.appendChild(card);
        });
    };

  const openLessonModal = (lesson = null) => {
    lessonForm.reset();
    currentLinkedResources = [];
    if (lesson) {
        lessonModalTitle.textContent = 'Edit Lesson Plan'; // Corrected variable name
        document.getElementById('lesson-id').value = lesson._id;
        document.getElementById('lesson-title').value = lesson.title;
        document.getElementById('lesson-subject').value = lesson.subject || '';
        document.getElementById('lesson-start-date').value = new Date(lesson.startDate).toISOString().split('T')[0];
        document.getElementById('lesson-end-date').value = lesson.endDate ? new Date(lesson.endDate).toISOString().split('T')[0] : '';
        document.getElementById('lesson-objectives').value = lesson.objectives || '';
        document.getElementById('lesson-notes').value = lesson.notes || '';
        currentLinkedResources = lesson.linkedResources.map(res => res._id);
    } else {
        lessonModalTitle.textContent = 'Create New Lesson Plan'; // Corrected variable name
        document.getElementById('lesson-id').value = '';
        document.getElementById('lesson-start-date').valueAsDate = new Date();
    }
    lessonModal.style.display = 'flex';
};

    const closeLessonModal = () => lessonModal.style.display = 'none';

    const openResourcePicker = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/resources?classId=${currentClassId}`);
            const allResources = await response.json();
            resourceChecklist.innerHTML = '';
            if (allResources.length === 0) {
                resourceChecklist.innerHTML = '<p>No resources found in this class library.</p>';
            } else {
                allResources.forEach(resource => {
                    const isChecked = currentLinkedResources.includes(resource._id);
                    resourceChecklist.innerHTML += `
                        <label class="checkbox-label">
                            <input type="checkbox" value="${resource._id}" ${isChecked ? 'checked' : ''}>
                            ${resource.title} (${resource.type})
                        </label>
                    `;
                });
            }
            resourcePickerModal.style.display = 'flex';
        } catch (error) { console.error('Error fetching resources for picker:', error); }
    };

    const closeResourcePicker = () => resourcePickerModal.style.display = 'none';

    // --- EVENT LISTENERS ---
    classSelect.addEventListener('change', () => { currentClassId = classSelect.value; fetchLessons(); });
    addLessonBtn.addEventListener('click', () => openLessonModal());
    cancelLessonBtn.addEventListener('click', closeLessonModal);
    attachResourcesBtn.addEventListener('click', openResourcePicker);
    cancelPickerBtn.addEventListener('click', closeResourcePicker);

    confirmPickerBtn.addEventListener('click', () => {
        const selectedCheckboxes = resourceChecklist.querySelectorAll('input[type="checkbox"]:checked');
        currentLinkedResources = Array.from(selectedCheckboxes).map(cb => cb.value);
        closeResourcePicker();
    });

    lessonForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const lessonData = {
            id: document.getElementById('lesson-id').value,
            title: document.getElementById('lesson-title').value,
            subject: document.getElementById('lesson-subject').value,
            startDate: document.getElementById('lesson-start-date').value,
            endDate: document.getElementById('lesson-end-date').value || null,
            objectives: document.getElementById('lesson-objectives').value,
            notes: document.getElementById('lesson-notes').value,
            classroomId: currentClassId,
        };
        saveLesson(lessonData);
    });

    lessonListContainer.addEventListener('click', async (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        const id = button.dataset.id;
        if (button.classList.contains('btn-edit')) {
            const response = await fetch(`http://localhost:5000/api/lessons?classId=${currentClassId}`);
            const lessons = await response.json();
            const lessonToEdit = lessons.find(l => l._id === id);
            if (lessonToEdit) openLessonModal(lessonToEdit);
        } else if (button.classList.contains('btn-delete')) {
            deleteLesson(id);
        }
    });

    // --- INITIAL PAGE LOAD ---
    populateClassroomDropdown();
});
// (The duplicate function that was here has been removed)