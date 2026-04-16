const axios = require('axios');
const ResourceHistory = require('../../Model/ResourcesFinder/ResourceFinderModel.js');

// TEMPORARY FAKE ID for testing without auth
const FAKE_USER_ID = "000000000000000000000000"; 

// Helper to resolve userId
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

// Helper to detect skill level from title and description
const detectSkillLevel = (title, description, query) => {
    const text = `${title} ${description}`.toLowerCase();
    const queryLower = query.toLowerCase();
    
    const advancedKeywords = ['advanced', 'expert', 'deep dive', 'architecture', 'system design', 'optimization', 'production', 'enterprise'];
    const intermediateKeywords = ['intermediate', 'beyond basics', 'advanced topics', 'best practices', 'patterns', 'design patterns'];
    const beginnerKeywords = ['beginner', 'tutorial', 'basics', 'introduction', 'intro', 'for beginners', 'start', 'getting started', 'learn from scratch'];
    
    let scores = { beginner: 0, intermediate: 0, advanced: 0 };
    
    // Check title intensively (more weight)
    if (advancedKeywords.some(k => title.toLowerCase().includes(k))) scores.advanced += 3;
    if (intermediateKeywords.some(k => title.toLowerCase().includes(k))) scores.intermediate += 3;
    if (beginnerKeywords.some(k => title.toLowerCase().includes(k))) scores.beginner += 3;
    
    // Check description
    if (advancedKeywords.some(k => text.includes(k))) scores.advanced += 1;
    if (intermediateKeywords.some(k => text.includes(k))) scores.intermediate += 1;
    if (beginnerKeywords.some(k => text.includes(k))) scores.beginner += 1;
    
    // Default to intermediate if no clear indicators
    if (scores.beginner === 0 && scores.intermediate === 0 && scores.advanced === 0) {
        return 'intermediate';
    }
    
    const max = Math.max(scores.beginner, scores.intermediate, scores.advanced);
    if (scores.advanced === max) return 'advanced';
    if (scores.beginner === max) return 'beginner';
    return 'intermediate';
};

// Helper to estimate video duration from description/title
const getVideoDuration = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();
    
    // Check for common duration indicators
    if (text.includes('5 min') || text.includes('5min')) return 300;
    if (text.includes('10 min') || text.includes('10min')) return 600;
    if (text.includes('15 min') || text.includes('15min')) return 900;
    if (text.includes('20 min') || text.includes('20min')) return 1200;
    if (text.includes('30 min') || text.includes('30min')) return 1800;
    if (text.includes('hour')) return 3600;
    
    // Check for keywords
    if (text.includes('complete') || text.includes('full course') || text.includes('comprehensive')) return 2400;
    if (text.includes('quick') || text.includes('short')) return 600;
    
    // Default to 15 minutes
    return 900;
};

// Helper to extract related topics
const getRelatedTopics = (query) => {
    const topics = {
        'react': ['javascript', 'hooks', 'state management', 'nextjs', 'jsx'],
        'javascript': ['typescript', 'async/await', 'promises', 'dom manipulation', 'web apis'],
        'python': ['django', 'flask', 'data science', 'machine learning', 'pandas'],
        'machine learning': ['tensorflow', 'neural networks', 'deep learning', 'numpy', 'sklearn'],
        'nodejs': ['express', 'mongodb', 'rest api', 'websockets', 'npm'],
        'css': ['tailwind', 'bootstrap', 'flexbox', 'grid', 'sass'],
        'typescript': ['interfaces', 'generics', 'decorators', 'advanced types', 'modules'],
        'database': ['sql', 'mongodb', 'redis', 'postgresql', 'query optimization'],
        'docker': ['kubernetes', 'containers', 'devops', 'ci/cd', 'microservices'],
        'devops': ['ci/cd', 'jenkins', 'docker', 'kubernetes', 'aws']
    };
    
    const queryLower = query.toLowerCase();
    for (const [key, related] of Object.entries(topics)) {
        if (queryLower.includes(key)) {
            return related;
        }
    }
    
    return ['best practices', 'tutorials', 'coding tips', 'debugging'];
};

// Search YouTube and save history with enhanced metadata
exports.searchResources = async (req, res) => {
    try {
        const { query } = req.body;
        const apiKey = process.env.YOUTUBE_API_KEY;

        if (!query) {
            return res.status(400).json({ success: false, message: "Search query is required" });
        }

        if (!apiKey) {
            console.error('YOUTUBE_API_KEY is not set in .env');
            return res.status(500).json({ success: false, message: "YouTube API is not configured. Please check server configuration." });
        }

        const userId = resolveUserId(req);
        console.log(`🔍 Searching for: "${query}" (userId: ${userId})`);

        // Call YouTube API with higher maxResults
        let ytResponse;
        try {
            ytResponse = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
                params: {
                    part: 'snippet',
                    maxResults: 20,
                    q: query,
                    type: 'video',
                    key: apiKey,
                    order: 'relevance'
                },
                timeout: 10000  // 10 second timeout
            });
        } catch (ytError) {
            console.error('❌ YouTube API error:', {
                status: ytError.response?.status,
                statusText: ytError.response?.statusText,
                message: ytError.response?.data?.error?.message || ytError.message,
                code: ytError.response?.data?.error?.errors?.[0]?.reason
            });

            // Provide helpful error messages
            if (ytError.response?.status === 403) {
                return res.status(403).json({ 
                    success: false, 
                    message: "YouTube API quota exceeded or API not enabled. Please check Google Cloud Console." 
                });
            }
            if (ytError.response?.status === 401) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Invalid YouTube API key. Please check your configuration." 
                });
            }

            return res.status(500).json({ 
                success: false, 
                message: `YouTube API error: ${ytError.response?.data?.error?.message || 'Unknown error'}. Please try again later.` 
            });
        }

        if (!ytResponse.data || !ytResponse.data.items || ytResponse.data.items.length === 0) {
            console.log(`⚠️ No videos found for: "${query}"`);
            return res.status(404).json({ success: false, message: "No videos found for this search query. Try a different topic." });
        }

        console.log(`✅ Found ${ytResponse.data.items.length} videos for "${query}"`);

        // Format results with enhanced metadata
        const videos = ytResponse.data.items.map(item => {
            const skillLevel = detectSkillLevel(item.snippet.title, item.snippet.description, query);
            const duration = getVideoDuration(item.snippet.title, item.snippet.description);
            
            return {
                title: item.snippet.title,
                description: item.snippet.description || 'No description available',
                videoId: item.id.videoId,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
                skillLevel: skillLevel,
                duration: duration,
                channel: item.snippet.channelTitle,
                publishedAt: item.snippet.publishedAt,
                resourceType: 'video'
            };
        });

        // Get related topics
        const relatedTopics = getRelatedTopics(query);

        // Save to user's personal history
        const newHistory = new ResourceHistory({
            userId,
            searchQuery: query,
            results: videos,
            relatedTopics: relatedTopics
        });
        await newHistory.save();

        res.status(200).json({ success: true, data: videos, relatedTopics: relatedTopics, totalResults: videos.length });

    } catch (error) {
        console.error("❌ Error searching resources:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
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