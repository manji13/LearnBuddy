// backend/Model/ResourceFinder/ResourceHistory.js
const mongoose = require('mongoose');

const resourceHistorySchema = new mongoose.Schema({
    // Links this history to a specific user
    userId: {
        type: String,  // Changed to String to handle both MongoDB IDs and fake IDs
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
        thumbnail: String,
        skillLevel: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            default: 'intermediate'
        },
        duration: Number,  // in seconds
        channel: String,
        publishedAt: String,
        resourceType: {
            type: String,
            default: 'video'
        }
    }],
    relatedTopics: {
        type: [String],
        default: []
    },
    searchedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ResourceHistory', resourceHistorySchema);