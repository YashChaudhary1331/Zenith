// In routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
    getResources,
    createResource,
    deleteResource
} = require('../controllers/resourceController');

// Configure multer for resource file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resources/'); // Save files to the 'uploads/resources' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage: storage });

// Define the routes
router.route('/').get(getResources).post(upload.single('resourceFile'), createResource);
router.route('/:id').delete(deleteResource);

module.exports = router;