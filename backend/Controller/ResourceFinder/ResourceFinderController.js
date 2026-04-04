const axios = require('axios');
const ResourceHistory = require('../../Model/ResourcesFinder/ResourceFinderModel.js');

// TEMPORARY FAKE ID for testing without auth (Must be 24 characters for MongoDB)
const FAKE_USER_ID = "000000000000000000000000"; 

// Helper to resolve userId (token-auth should set req.userId in future)
const resolveUserId = (req) => {
    const fromBody = req.body?.userId;
    const fromQuery = req.query?.userId;
    const fromHeader = req.header('x-user-id');
    if (fromBody) return fromBody;
    if (fromQuery) return fromQuery;
    if (fromHeader) return fromHeader;
    if (req.userId) return req.userId;
    return FAKE_USER_ID;
};

// Search YouTube and save history
exports.searchResources = async (req, res) => {
    try {
        const { query } = req.body;
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const userId = resolveUserId(req);

        // Call YouTube API
        let ytResponse;
        try {
            ytResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                    part: 'snippet',
                    maxResults: 5, 
                    q: query,
                    type: 'video',
                    key: apiKey
                }
            });
        } catch (ytError) {
            console.error('YouTube API error:', ytError.response?.data || ytError.message);
            return res.status(500).json({ success: false, message: "YouTube API error. Please check your API key or try again later." });
        }

        if (!ytResponse.data || !ytResponse.data.items || ytResponse.data.items.length === 0) {
            return res.status(404).json({ success: false, message: "No videos found for this search query." });
        }

        // Format the results
        const videos = ytResponse.data.items.map(item => ({
            title: item.snippet.title,
            description: item.snippet.description,
            videoId: item.id.videoId,
            thumbnail: item.snippet.thumbnails.default.url
        }));

        // Save to user's personal history
        const newHistory = new ResourceHistory({
            userId,
            searchQuery: query,
            results: videos
        });
        await newHistory.save();

        res.status(200).json({ success: true, data: videos });

    } catch (error) {
        console.error("Error searching resources:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Get history 
exports.getUserHistory = async (req, res) => {
    try {
        const userId = resolveUserId(req);

        // Find history for this user, sorted by newest first
        const history = await ResourceHistory.find({ userId }).sort({ searchedAt: -1 });
        
        res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// Delete a single history item
exports.deleteHistoryItem = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        const itemId = req.params.id;

        const removed = await ResourceHistory.findOneAndDelete({ _id: itemId, userId });
        if (!removed) {
            return res.status(404).json({ success: false, message: 'History item not found' });
        }

        res.status(200).json({ success: true, message: 'History item deleted' });
    } catch (error) {
        console.error('Error deleting history item:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Delete all history for a user
exports.deleteAllHistory = async (req, res) => {
    try {
        const userId = resolveUserId(req);
        await ResourceHistory.deleteMany({ userId });
        res.status(200).json({ success: true, message: 'All history cleared' });
    } catch (error) {
        console.error('Error clearing history:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};