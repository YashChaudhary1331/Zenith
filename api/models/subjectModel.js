// In models/subjectModel.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a subject name'],
        trim: true,
        unique: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);