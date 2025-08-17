// --- DOM Elements ---
const classSelect = document.getElementById('activities-class-select');
const activityCreator = document.getElementById('activity-creator');
const activityList = document.getElementById('activity-list');
const activityForm = document.getElementById('activity-form');
let currentClassId = null;

// --- API & Display Functions ---

const populateClassroomDropdown = async () => {
    try {
        const response = await fetch('/api/classrooms');
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

const displayActivities = (activities) => {
    activityList.innerHTML = '';
    if (activities.length === 0) {
        activityList.innerHTML = '<p>No activities posted yet for this class.</p>';
        return;
    }
    activities.forEach(activity => {
        const card = document.createElement('div');
        card.className = 'activity-card';
        card.innerHTML = `
            <img src="${activity.imageUrl}" alt="${activity.title}">
            <div class="activity-card-content">
                <p class="date">${activity.date ? new Date(activity.date).toLocaleDateString() : 'No Date'}</p>
                <h4>${activity.title}</h4>
                <p>${activity.description || ''}</p>
                <button class="btn btn-delete-activity" data-activityid="${activity._id}">Delete</button>
            </div>
        `;
        activityList.appendChild(card);
    });
};

const fetchAndDisplayActivities = async () => {
    activityCreator.style.display = 'none';
    activityList.innerHTML = '';
    if (!currentClassId) return;

    activityCreator.style.display = 'block';
    try {
        const response = await fetch(`/api/activities?classId=${currentClassId}`);
        if (!response.ok) throw new Error('Failed to fetch activities');
        const activities = await response.json();
        displayActivities(activities);
    } catch (error) { console.error('Error fetching activities:', error); }
};

const deleteActivity = async (activityId) => {
    try {
        const response = await fetch(`/api/activities/${activityId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete activity');
        fetchAndDisplayActivities();
    } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Failed to delete activity.');
    }
};


// --- Event Listeners ---

classSelect.addEventListener('change', () => {
    currentClassId = classSelect.value;
    fetchAndDisplayActivities();
});

activityForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentClassId) {
        alert('Please select a class first.');
        return;
    }

    const formData = new FormData();
    formData.append('title', document.getElementById('activity-title').value);
    formData.append('description', document.getElementById('activity-description').value);
    formData.append('date', document.getElementById('activity-date').value);
    formData.append('image', document.getElementById('activity-image').files[0]);
    formData.append('classroomId', currentClassId);

    try {
        const response = await fetch('/api/activities', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to post activity');
        }
        fetchAndDisplayActivities();
        e.target.reset();
        // Set date back to today after reset
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('activity-date').value = today;

    } catch (error) {
        console.error('Error posting activity:', error);
        alert('Failed to post activity. Please check console for details.');
    }
});

activityList.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete-activity')) {
        const activityId = e.target.dataset.activityid;
        if (confirm('Are you sure you want to delete this activity?')) {
            deleteActivity(activityId);
        }
    }
});

// --- Initial Page Load ---
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('activity-date').value = today;
    populateClassroomDropdown();
});