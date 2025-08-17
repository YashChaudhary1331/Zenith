const Activity = require('../models/activityModel');
const { cloudinary } = require('../config/cloudinaryConfig'); // Import Cloudinary

// Helper to extract public_id from Cloudinary URL
const getPublicId = (url) => url.split('/').slice(-3).join('/').split('.')[0];

// @desc    Get activities by class
// @route   GET /api/activities?classId=...
const getActivitiesByClass = async (req, res) => {
  try {
    const activities = await Activity.find({ classroomId: req.query.classId }).sort({ date: -1 });
    res.status(200).json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching activities.' });
  }
};

// @desc    Create a new activity
// @route   POST /api/activities
const createActivity = async (req, res) => {
  try {
    const { title, description, date, classroomId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }
    if (!title || !date || !classroomId) {
        return res.status(400).json({ message: 'Title, date, and classroom are required.' });
    }

    const activity = await Activity.create({
      title,
      description,
      date,
      classroomId,
      imageUrl: req.file.path, // Save the Cloudinary URL
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating activity.', error: error.message });
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // If there's an image URL, delete the image from Cloudinary
    if (activity.imageUrl) {
        const publicId = getPublicId(activity.imageUrl);
        cloudinary.uploader.destroy(publicId);
    }

    // Delete the activity from the database
    await Activity.findByIdAndDelete(req.params.id);

    res.status(200).json({ id: req.params.id, message: 'Activity removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting activity.' });
  }
};

module.exports = {
  getActivitiesByClass,
  createActivity,
  deleteActivity,
};