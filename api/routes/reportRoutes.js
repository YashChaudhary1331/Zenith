// In routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { generateReportCard, saveReportConfig } = require('../controllers/reportController');

// Configure Multer for logo upload
const logoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/templates/';
        if (!fs.existsSync(dir)) { fs.mkdirSync(dir, { recursive: true }); }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Save the logo with a fixed name and original extension
        cb(null, `school-logo${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: logoStorage });

// --- ROUTES ---
router.get('/report-card/:studentId', generateReportCard);
// The 'schoolLogo' key must match the key in the FormData
router.post('/save-config', upload.single('schoolLogo'), saveReportConfig);

module.exports = router;