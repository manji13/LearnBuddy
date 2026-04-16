const express = require('express');
const feedbackController = require('../../Controller/Feedback/feedbackController');

const router = express.Router();

router.post('/', feedbackController.createFeedback);
router.get('/', feedbackController.getFeedback);
router.get('/admin', feedbackController.getAllForAdmin);
router.patch('/:id/approve', feedbackController.approveFeedback);
router.delete('/:id', feedbackController.deleteFeedback);

module.exports = router;
