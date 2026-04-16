const express = require('express');
const bookmarkController = require('../../Controller/Bookmark/bookmarkController');

const router = express.Router();

router.post('/', bookmarkController.createBookmark);
router.get('/', bookmarkController.getBookmarks);
router.get('/user/:userId', bookmarkController.getUserSavedResources);
router.delete('/:id', bookmarkController.deleteBookmark);

module.exports = router;
