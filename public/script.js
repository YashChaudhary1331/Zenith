// --- Global Chart Variables ---
let myAttendanceChart = null;
let myPerformanceChart = null;

// --- DOM Elements ---
const classSelect = document.getElementById('dashboard-class-select');
const statCardsContainer = document.getElementById('stat-cards');
const highPerformersList = document.getElementById('high-performers-list');
const lowAttendanceList = document.getElementById('low-attendance-list');
const lowPerformanceList = document.getElementById('low-performance-list');
const recentActivitiesList = document.getElementById('recent-activities-list');
const upcomingBirthdaysList = document.getElementById('upcoming-birthdays-list');
const upcomingDeadlinesList = document.getElementById('upcoming-deadlines-list');
const subjectPerformanceList = document.getElementById('subject-performance-list');
const performanceTrendChart = document.getElementById('performanceTrendChart');
const quickNotesPad = document.getElementById('quick-notes-pad');


// --- Render Functions ---
const renderStatCards = (stats) => {
  statCardsContainer.innerHTML = `
    <div class="stat-card">
      <div class="icon" style="color: #3B82F6; background-color: #DBEAFE;">🎓</div>
      <div class="text-content">
        <h3>Total Students</h3>
        <p class="stat-value">${stats.totalStudents}</p>
      </div>
    </div>
    <div class="stat-card">
      <div class="icon" style="color: #16A34A; background-color: #DCFCE7;">🏫</div>
      <div class="text-content">
        <h3>Total Classrooms</h3>
        <p class="stat-value">${stats.totalClassrooms}</p>
      </div>
    </div>
    <div class="stat-card">
      <div class="icon" style="color: #F59E0B; background-color: #FEF3C7;">📈</div>
      <div class="text-content">
        <h3>Avg. Attendance</h3>
        <p class="stat-value">${stats.averageAttendance}%</p>
      </div>
    </div>
  `;
};

const renderStudentList = (container, students) => {
  if (!container) return;
  if (!students || students.length === 0) {
    container.innerHTML = '<p>No students to show in this category.</p>';
    return;
  }
  container.innerHTML = students.map(student => `
    <div class="student-attention-list-item">
      <img src="${student.photograph || './images/logo.png'}" alt="Photo">
      <div><strong>${student.name}</strong></div>
    </div>
  `).join('');
};

const renderActivities = (activities) => {
    if (!recentActivitiesList) return;
    if (!activities || activities.length === 0) {
        recentActivitiesList.innerHTML = '<p>No recent activities.</p>';
        return;
    }
    recentActivitiesList.innerHTML = activities.map(activity => `
        <div class="activity-feed-item">
            <img src="${activity.imageUrl}" alt="Activity Photo">
            <div>
                <strong>${activity.title}</strong>
                <p>${activity.date ? new Date(activity.date).toLocaleDateString() : 'No Date'}</p>
            </div>
        </div>
    `).join('');
};

const renderAttendanceChart = (attendanceData) => {
    const chartCanvas = document.getElementById('attendanceChart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');

    if (myAttendanceChart) {
        myAttendanceChart.destroy();
    }
    myAttendanceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent', 'Late'],
            datasets: [{
                label: 'Attendance',
                data: [attendanceData.present, attendanceData.absent, attendanceData.late],
                backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
                borderColor: 'var(--card-background, #FFFFFF)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
        }
    });
};

const renderUpcomingBirthdays = (students) => {
    if (!upcomingBirthdaysList) return;
    if (!students || students.length === 0) {
        upcomingBirthdaysList.innerHTML = '<p>No upcoming birthdays this week.</p>';
        return;
    }
    upcomingBirthdaysList.innerHTML = students.map(student => `
        <div class="student-attention-list-item">
            <img src="${student.photograph || './images/logo.png'}" alt="Photo">
            <div><strong>${student.name}</strong></div>
            <div class="stat">${new Date(student.dateOfBirth).toLocaleDateString('en-GB', {day: 'numeric', month: 'long'})}</div>
        </div>
    `).join('');
};

const renderUpcomingDeadlines = (assignments) => {
    if (!upcomingDeadlinesList) return;
    if (!assignments || assignments.length === 0) {
        upcomingDeadlinesList.innerHTML = '<p>No assignments due soon.</p>';
        return;
    }
    upcomingDeadlinesList.innerHTML = assignments.map(assignment => `
        <div class="student-attention-list-item">
            <div>
                <strong>${assignment.assignmentName}</strong>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">${assignment.subject}</p>
            </div>
            <div class="stat">${new Date(assignment.dueDate).toLocaleDateString()}</div>
        </div>
    `).join('');
};

const renderPerformanceTrend = (trendData) => {
    const chartCanvas = document.getElementById('performanceTrendChart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');

    if (myPerformanceChart) {
        myPerformanceChart.destroy();
    }

    if (!trendData || trendData.length < 2) {
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
        ctx.font = "16px sans-serif";
        ctx.fillStyle = "#9ca3af";
        ctx.textAlign = "center";
        ctx.fillText("Not enough data to show a trend.", chartCanvas.width / 2, chartCanvas.height / 2);
        return;
    }

    myPerformanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: trendData.map(d => d.label),
            datasets: [{
                label: 'Class Average Score (%)',
                data: trendData.map(d => d.averageScore),
                borderColor: '#5B98C8',
                backgroundColor: 'rgba(91, 152, 200, 0.1)',
                fill: true,
                tension: 0.3,
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100 }
            },
            plugins: { legend: { display: false } }
        }
    });
};

const renderSubjectPerformance = (subjects) => {
    if (!subjectPerformanceList) return;
    if (!subjects || subjects.length === 0) {
        subjectPerformanceList.innerHTML = '<p>No scores recorded yet.</p>';
        return;
    }
    subjectPerformanceList.innerHTML = subjects.map(item => `
        <div class="student-attention-list-item">
            <div><strong>${item.subject}</strong></div>
            <div class="stat">${item.average}%</div>
        </div>
    `).join('');
};

// --- API & Control Functions ---
const fetchDashboardData = async (classId = '') => {
  try {
    const response = await fetch(`/api/dashboard/stats?classId=${classId}`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    const data = await response.json();

    renderStatCards(data);
    renderStudentList(highPerformersList, data.highPerformersList);
    renderStudentList(lowPerformanceList, data.lowPerformanceStudents);
    renderActivities(data.recentActivities);
    renderAttendanceChart(data.todaysAttendance);
    renderUpcomingBirthdays(data.upcomingBirthdays);
    renderUpcomingDeadlines(data.upcomingDeadlines);
    renderPerformanceTrend(data.performanceTrend);
    renderSubjectPerformance(data.subjectAverages);
  } catch (error) { console.error('Error fetching dashboard data:', error); }
};

const populateClassroomDropdown = async () => {
    try {
        const response = await fetch('/api/classrooms');
        if (!response.ok) throw new Error('Failed to fetch classrooms');
        const classrooms = await response.json();
        classSelect.innerHTML = '<option value="">All Classes</option>';
        classrooms.forEach(c => {
            const option = document.createElement('option');
            option.value = c._id;
            option.textContent = c.name;
            classSelect.appendChild(option);
        });
    } catch (error) { console.error('Error:', error); }
};

const initializeDragAndDrop = () => {
    const dashboardGrid = document.getElementById('dashboard-grid');
    if (!dashboardGrid) return;

    const savedOrder = JSON.parse(localStorage.getItem('dashboardOrder'));
    if (savedOrder) {
        savedOrder.forEach(widgetId => {
            const widget = document.getElementById(widgetId);
            if (widget) {
                dashboardGrid.appendChild(widget);
            }
        });
    }

    new Sortable(dashboardGrid, {
        handle: '.drag-handle', 
        animation: 150, 
        ghostClass: 'sortable-ghost',

        onEnd: function () {
            const newOrder = Array.from(dashboardGrid.children).map(child => child.id);
            localStorage.setItem('dashboardOrder', JSON.stringify(newOrder));
        }
    });
};


// --- Event Listeners ---
classSelect.addEventListener('change', () => {
    fetchDashboardData(classSelect.value);
});

document.addEventListener('DOMContentLoaded', () => {
    if (quickNotesPad) {
      quickNotesPad.value = localStorage.getItem('zenithQuickNotes') || '';
      quickNotesPad.addEventListener('keyup', () => {
          localStorage.setItem('zenithQuickNotes', quickNotesPad.value);
      });
    }
    populateClassroomDropdown();
    fetchDashboardData();
    initializeDragAndDrop()
});