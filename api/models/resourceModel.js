// In models/resourceModel.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a resource title'],
        trim: true,
    },
    description: {
        type: String,
    },
    // This field distinguishes between an uploaded file and an external link
    type: {
        type: String,
        required: true,
        enum: ['file', 'link'],
    },
    // URL for 'link' type resources
    url: {
        type: String,
    },
    // Path for 'file' type resources
    filePath: {
        type: String,
    },
    // Original filename for 'file' type resources
    fileName: {
        type: String,
    },
    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Classroom',
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Resource', resourceSchema);