// In portal.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('zenith-portal-token');
    const role = localStorage.getItem('zenith-user-role'); // Get the role

    // If no token or role is found, redirect to the login page
    if (!token || !role) {
        // Clear any partial data before redirecting
        localStorage.removeItem('zenith-portal-token');
        localStorage.removeItem('zenith-user-role');
        window.location.href = 'portal-login.html';
        return;
    }

    // --- DOM Elements ---
    const welcomeHeading = document.getElementById('welcome-heading');
    const portalStatsContainer = document.getElementById('portal-stats');
    const gradesTableBody = document.getElementById('grades-table-body');
    const activityListContainer = document.getElementById('activity-list-portal');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Messaging Elements (Will only exist on parent portal) ---
    const messageDisplayArea = document.getElementById('message-display-area');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    // --- Render Functions ---
    const renderStats = (studentDetails) => {
        const totalDays = studentDetails.attendance.length;
        const presentDays = studentDetails.attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(0) : 'N/A';

        portalStatsContainer.innerHTML = `
            <div class="stat-card">
                <div class="text-content">
                    <h3>Overall Attendance</h3>
                    <p class="stat-value">${attendancePercentage}%</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="text-content">
                    <h3>Days Absent</h3>
                    <p class="stat-value">${totalDays - presentDays}</p>
                </div>
            </div>
        `;
    };

    const renderGrades = (marks) => {
        if (marks.length === 0) {
            gradesTableBody.innerHTML = '<tr><td colspan="4">No grades have been recorded yet.</td></tr>';
            return;
        }
        gradesTableBody.innerHTML = marks.map(mark => `
            <tr>
                <td>${mark.assignmentName}</td>
                <td>${mark.subject}</td>
                <td><strong>${mark.score} / ${mark.maxScore}</strong></td>
                <td>${mark.percentage}%</td>
            </tr>
        `).join('');
    };

    const renderActivities = (activities) => {
        if (activities.length === 0) {
            activityListContainer.innerHTML = '<p>No classroom activities have been posted yet.</p>';
            return;
        }
        activityListContainer.innerHTML = activities.map(activity => `
            <div class="activity-card">
                <img src="${activity.imageUrl}" alt="${activity.title}">
                <div class="activity-card-content">
                    <p class="date">${new Date(activity.date).toLocaleDateString()}</p>
                    <h4>${activity.title}</h4>
                    <p>${activity.description || ''}</p>
                </div>
            </div>
        `).join('');
    };

    const renderMessages = (messages) => {
        if (!messageDisplayArea) return;
        messageDisplayArea.innerHTML = messages.map(msg => `
            <div class="message ${msg.senderRole === 'teacher' ? 'received' : 'sent'}">
                <p>${msg.messageText}</p>
                <span class="timestamp">${new Date(msg.createdAt).toLocaleString()}</span>
            </div>
        `).join('');
        messageDisplayArea.scrollTop = messageDisplayArea.scrollHeight;
    };

    // --- Main Fetch Functions ---
    const fetchPortalData = async () => {
        try {
            const response = await fetch('/api/portal/data', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                if (response.status === 401) { // Unauthorized (bad token)
                    logoutBtn.click(); // Trigger logout
                }
                throw new Error('Failed to fetch portal data');
            }

            const data = await response.json();

            if (role === 'parent') {
                welcomeHeading.textContent = `Portal for ${data.studentDetails.name}`;
            } else { // role === 'student'
                welcomeHeading.textContent = `Welcome, ${data.studentDetails.name}`;
            }

            renderStats(data.studentDetails);
            renderGrades(data.marks);
            renderActivities(data.activities);

        } catch (error) {
            console.error('Failed to fetch portal data:', error);
            document.body.innerHTML = '<p>Could not load portal data. Please try again later.</p>';
        }
    };


    const fetchMessages = async () => {
        // Only fetch messages if the user is a parent and the chat elements exist
        if (role !== 'parent' || !messageDisplayArea) return;

        try {
            const response = await fetch('/api/messages/portal/conversation', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch messages');
            const messages = await response.json();
            renderMessages(messages);
        } catch (error) {
            console.error(error);
            if(messageDisplayArea) messageDisplayArea.innerHTML = '<p>Could not load messages.</p>';
        }
    };

    // --- Event Listeners ---
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('zenith-portal-token');
        localStorage.removeItem('zenith-user-role');
        window.location.href = 'portal-login.html';
    });

    // Only add the message form listener if the elements exist on the page
    if (messageForm) {
        messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageText = messageInput.value.trim();
            if (!messageText) return;

            try {
                const response = await fetch('/api/messages/portal/conversation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ messageText })
                });

                if (!response.ok) throw new Error('Message failed to send');

                messageInput.value = ''; // Clear the input
                fetchMessages(); // Refresh the chat window with the new message
            } catch (error) {
                console.error('Failed to send message:', error);
                alert('Your message could not be sent.');
            }
        });
    }

    // --- Initial Load ---
    fetchPortalData();
    fetchMessages(); // Fetch messages when the page loads
});