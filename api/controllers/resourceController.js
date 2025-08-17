// In controllers/resourceController.js
const fs = require('fs');
const path = require('path');
const Resource = require('../models/resourceModel');

// @desc    Get resources for a specific class
// @route   GET /api/resources
const getResources = async (req, res) => {
    const resources = await Resource.find({ classroomId: req.query.classId }).sort({ createdAt: -1 });
    res.status(200).json(resources);
};

// @desc    Create a new resource (file or link)
// @route   POST /api/resources
const createResource = async (req, res) => {
    const { title, description, type, url, classroomId } = req.body;

    if (!title || !type || !classroomId) {
        return res.status(400).json({ message: 'Title, type, and classroom are required.' });
    }

    const resourceData = { title, description, type, classroomId };

    if (type === 'link') {
        if (!url) return res.status(400).json({ message: 'URL is required for link type.' });
        resourceData.url = url;
    } else if (type === 'file') {
        if (!req.file) return res.status(400).json({ message: 'A file is required for file type.' });
        resourceData.filePath = `/uploads/resources/${req.file.filename}`;
        resourceData.fileName = req.file.originalname;
    } else {
        return res.status(400).json({ message: 'Invalid resource type.' });
    }

    const resource = await Resource.create(resourceData);
    res.status(201).json(resource);
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
const deleteResource = async (req, res) => {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
    }

    // If the resource is a file, delete it from the server's storage
    if (resource.type === 'file' && resource.filePath) {
        const fullPath = path.join(__dirname, '..', resource.filePath);
        fs.unlink(fullPath, (err) => {
            if (err) console.error("Failed to delete resource file:", err);
        });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id, message: 'Resource removed' });
};

module.exports = {
    getResources,
    createResource,
    deleteResource,
};