// Import necessary packages
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const studentRoutes = require('./routes/studentRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const classroomRoutes = require('./routes/classroomRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const activityRoutes = require('./routes/activityRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes'); 
const portalRoutes = require('./routes/portalRoutes');
const aiRoutes = require('./routes/aiRoutes'); 
const lessonRoutes = require('./routes/lessonRoutes'); 
const resourceRoutes = require('./routes/resourceRoutes'); 
const reportRoutes = require('./routes/reportRoutes'); 
const messageRoutes = require('./routes/messageRoutes');
const subjectRoutes = require('./routes/subjectRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to the database
connectDB();    

// Create an instance of the Express application
const app = express();

// --- Middleware Setup ---
app.use(cors());
app.use(express.json()); 
app.use('/uploads', express.static('uploads'));

// --- API Routes Setup ---
app.use('/api/auth', authRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/messages', messageRoutes); // This line activates the messaging endpoints
app.use('/api/subjects', subjectRoutes);


// A simple test route to make sure the server is working
app.get('/', (req, res) => {
  res.send('Hello from Zenith API!');
});

// Define the port the server will run on
const PORT = process.env.PORT || 5000;

module.exports = app;