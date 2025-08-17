// In controllers/resourceController.js
const Resource = require('../models/resourceModel');
const { cloudinary } = require('../config/cloudinaryConfig');

// Helper to extract public_id from Cloudinary URL
const getPublicId = (url) => {
    // For resources, the format is zenith/resources/public_id
    return url.split('/').slice(-2).join('/').split('.')[0];
};

// @desc    Get resources for a specific class
const getResources = async (req, res) => {
    const resources = await Resource.find({ classroomId: req.query.classId }).sort({ createdAt: -1 });
    res.status(200).json(resources);
};

// @desc    Create a new resource (file or link)
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
        resourceData.filePath = req.file.path; // Save the Cloudinary URL
        resourceData.fileName = req.file.originalname;
    } else {
        return res.status(400).json({ message: 'Invalid resource type.' });
    }

    const resource = await Resource.create(resourceData);
    res.status(201).json(resource);
};

// @desc    Delete a resource
const deleteResource = async (req, res) => {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
    }

    // If the resource is a file, delete it from Cloudinary
    if (resource.type === 'file' && resource.filePath) {
        const publicId = getPublicId(resource.filePath);
        // We tell Cloudinary it's a 'raw' file type to delete non-image files
        cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id, message: 'Resource removed' });
};

module.exports = {
    getResources,
    createResource,
    deleteResource,
};