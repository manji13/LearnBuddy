const express = require('express');
const interactionController = require('../../Controller/Interaction/InteractionController');

const router = express.Router();

router.post('/like', interactionController.toggleLike);
router.post('/comment', interactionController.addComment);
router.post('/comment/:commentId/like', interactionController.toggleCommentLike);
router.get('/:resourceId', interactionController.getInteractions);

module.exports = router;
