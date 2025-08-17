// In resources.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const classSelect = document.getElementById('resource-class-select');
    const addResourceBtn = document.getElementById('add-resource-btn');
    const resourceListContainer = document.getElementById('resource-list');
    const modal = document.getElementById('resource-modal');
    const resourceForm = document.getElementById('resource-form');
    const cancelBtn = document.getElementById('cancel-resource-btn');
    const resourceTypeRadios = document.querySelectorAll('input[name="resourceType"]');
    const fileInputContainer = document.getElementById('file-input-container');
    const linkInputContainer = document.getElementById('link-input-container');
    let currentClassId = null;

    // --- Display Functions ---
    const displayResources = (resources) => {
        resourceListContainer.innerHTML = '';
        if (resources.length === 0) {
            resourceListContainer.innerHTML = '<p>No resources uploaded for this class yet.</p>';
            return;
        }
        resources.forEach(resource => {
            const card = document.createElement('div');
            card.className = 'resource-card';
            card.dataset.type = resource.type;

            // FIX: Use the full Cloudinary URL for downloads, or the link URL
            const actionButton = resource.type === 'file'
                ? `<a href="${resource.filePath}" download="${resource.fileName}" target="_blank" class="btn-edit">Download</a>`
                : `<a href="${resource.url}" target="_blank" class="btn-edit">Open Link</a>`;

            card.innerHTML = `
                <h4>${resource.title}</h4>
                <p>${resource.description || ''}</p>
                <div class="resource-card-actions">
                    <span class="file-name">${resource.type === 'file' ? resource.fileName : 'External Link'}</span>
                    <div>
                        ${actionButton}
                        <button class="btn-delete" data-id="${resource._id}">Delete</button>
                    </div>
                </div>
            `;
            resourceListContainer.appendChild(card);
        });
    };

    // --- API Functions ---
    const fetchResources = async () => {
        if (!currentClassId) {
            resourceListContainer.innerHTML = '<p>Please select a class to view resources.</p>';
            return;
        }
        try {
            // FIX: Use relative URL
            const response = await fetch(`/api/resources?classId=${currentClassId}`);
            const resources = await response.json();
            displayResources(resources);
        } catch (error) { console.error('Error fetching resources:', error); }
    };

    const addResource = async (formData) => {
        try {
            // FIX: Use relative URL
            const response = await fetch('/api/resources', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to save resource');
            closeResourceModal();
            fetchResources();
        } catch (error) { console.error('Error saving resource:', error); }
    };

    const deleteResource = async (id) => {
        if (!confirm('Are you sure you want to delete this resource?')) return;
        try {
            // FIX: Use relative URL
            await fetch(`/api/resources/${id}`, { method: 'DELETE' });
            fetchResources();
        } catch (error) { console.error('Error deleting resource:', error); }
    };

    // --- Modal Functions ---
    const openResourceModal = () => {
        resourceForm.reset();
        document.querySelector('input[name="resourceType"][value="file"]').checked = true;
        fileInputContainer.style.display = 'block';
        linkInputContainer.style.display = 'none';
        modal.style.display = 'flex';
    };

    const closeResourceModal = () => modal.style.display = 'none';

    // --- Event Listeners ---
    classSelect.addEventListener('change', () => {
        currentClassId = classSelect.value;
        fetchResources();
    });

    addResourceBtn.addEventListener('click', openResourceModal);
    cancelBtn.addEventListener('click', closeResourceModal);

    resourceTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'file') {
                fileInputContainer.style.display = 'block';
                linkInputContainer.style.display = 'none';
            } else {
                fileInputContainer.style.display = 'none';
                linkInputContainer.style.display = 'block';
            }
        });
    });

    resourceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.querySelector('input[name="resourceType"]:checked').value;

        const formData = new FormData();
        formData.append('title', document.getElementById('resource-title').value);
        formData.append('description', document.getElementById('resource-description').value);
        formData.append('type', type);
        formData.append('classroomId', currentClassId);

        if (type === 'file') {
            const fileInput = document.getElementById('resource-file');
            if (fileInput.files.length > 0) {
                formData.append('resourceFile', fileInput.files[0]);
            } else {
                alert('Please select a file to upload.');
                return;
            }
        } else { // type === 'link'
            const url = document.getElementById('resource-url').value;
            if (url) {
                formData.append('url', url);
            } else {
                alert('Please enter a URL.');
                return;
            }
        }
        addResource(formData);
    });

    resourceListContainer.addEventListener('click', (e) => {
        const button = e.target.closest('button.btn-delete');
        if (button) {
            deleteResource(button.dataset.id);
        }
    });

    // --- Initial Load ---
    const populateClassroomDropdown = async () => {
        try {
            // FIX: Use relative URL
            const response = await fetch('/api/classrooms');
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

    populateClassroomDropdown();
});