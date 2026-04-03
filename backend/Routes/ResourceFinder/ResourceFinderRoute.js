// backend/Routes/ResourceFinder/resourceRoutes.js
const express = require('express');
const router = express.Router();
// Ensure the file name at the end of this path exactly matches your actual file
const { searchResources, getUserHistory, deleteHistoryItem, deleteAllHistory } = require('../../Controller/ResourceFinder/ResourceFinderController.js');
const { protect } = require('../../middleware/authMiddleware.js');

// With proper authentication / fallback to x-user-id header for development
router.post('/search', protect, searchResources);
router.get('/history', protect, getUserHistory);
router.delete('/history/:id', protect, deleteHistoryItem);
router.delete('/history', protect, deleteAllHistory);

module.exports = router;