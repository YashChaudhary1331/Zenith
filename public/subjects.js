// In subjects.js
document.addEventListener('DOMContentLoaded', () => {
    const subjectForm = document.getElementById('subject-form');
    const subjectList = document.getElementById('subject-list');

    const fetchAndDisplaySubjects = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/subjects');
            const subjects = await response.json();
            displaySubjects(subjects);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            subjectList.innerHTML = '<p>Could not load subjects.</p>';
        }
    };

    const displaySubjects = (subjects) => {
        subjectList.innerHTML = '';
        if (subjects.length === 0) {
            subjectList.innerHTML = '<p>No subjects have been added yet.</p>';
            return;
        }
        subjects.forEach(subject => {
            const subjectItem = document.createElement('div');
            subjectItem.className = 'subject-card'; // We'll use this class for styling
            subjectItem.innerHTML = `
                <div class="subject-name">${subject.name}</div>
                <button class="btn btn-delete" data-id="${subject._id}">Delete</button>
            `;
            subjectList.appendChild(subjectItem);
        });
    };

    const addSubject = async (name) => {
        try {
            const response = await fetch('http://localhost:5000/api/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (!response.ok) throw new Error('Failed to add subject');
            fetchAndDisplaySubjects();
            subjectForm.reset();
        } catch (error) {
            console.error('Error adding subject:', error);
            alert('Failed to add subject. It might already exist.');
        }
    };

    const deleteSubject = async (id) => {
        if (!confirm('Are you sure you want to delete this subject?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/subjects/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete subject');
            fetchAndDisplaySubjects();
        } catch (error) {
            console.error('Error deleting subject:', error);
            alert('Failed to delete subject.');
        }
    };

    subjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subjectName = document.getElementById('subject-name').value;
        addSubject(subjectName);
    });

    subjectList.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-delete')) {
            const subjectId = e.target.dataset.id;
            deleteSubject(subjectId);
        }
    });

    fetchAndDisplaySubjects();
});