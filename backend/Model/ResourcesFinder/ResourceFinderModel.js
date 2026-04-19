// backend/Model/ResourceFinder/ResourceHistory.js
const mongoose = require('mongoose');

const resourceHistorySchema = new mongoose.Schema({
    // Links this history to a specific user
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Ensure this matches your actual User model name
        required: true
    },
    searchQuery: {
        type: String,
        required: true
    },
    results: [{
        title: String,
        description: String,
        videoId: String,
        thumbnail: String
    }],
    searchedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ResourceHistory', resourceHistorySchema);