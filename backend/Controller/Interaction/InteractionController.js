const Like = require('../../models/Interaction/LikeModel');
const Comment = require('../../models/Interaction/CommentModel');
const User = require('../../Model/User Management/UserModel');

// POST /api/interactions/like
exports.toggleLike = async (req, res) => {
  try {
    const { resourceId, userId, action } = req.body;
    const requestedAction = action || 'like';

    if (!resourceId || !userId) return res.status(400).json({ success: false, message: 'resourceId and userId are required' });

    const existingLike = await Like.findOne({ resourceId, userId });

    if (existingLike) {
      if (existingLike.reactionType === requestedAction) {
        await Like.deleteOne({ _id: existingLike._id });
        return res.json({ success: true, removed: true, reactionType: requestedAction });
      } else {
        existingLike.reactionType = requestedAction;
        await existingLike.save();
        return res.json({ success: true, removed: false, reactionType: requestedAction });
      }
    } else {
      await Like.create({ resourceId, userId, reactionType: requestedAction });
      return res.json({ success: true, removed: false, reactionType: requestedAction });
    }
  } catch (err) {
    console.error('Error in toggleLike:', err);
    return res.status(500).json({ success: false, message: 'Failed to toggle reaction' });
  }
};

// POST /api/interactions/comment
exports.addComment = async (req, res) => {
  try {
    const { resourceId, userId, text, parentId } = req.body;
    if (!resourceId || !userId || !text) return res.status(400).json({ success: false, message: 'Fields required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const commentData = { resourceId, userId, name: user.fullName, text };
    if (parentId) commentData.parentId = parentId;

    const comment = await Comment.create(commentData);
    return res.status(201).json({ success: true, data: comment });
  } catch (err) {
    console.error('Error in addComment:', err);
    return res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};

// GET /api/interactions/:resourceId
exports.getInteractions = async (req, res) => {
  try {
    const { resourceId } = req.params;
    if (resourceId === 'bulk') {
      const allLikes = await Like.find({});
      const map = {};
      allLikes.forEach(l => {
        if (!map[l.resourceId]) map[l.resourceId] = 0;
        if (l.reactionType === 'like') map[l.resourceId]++;
        if (l.reactionType === 'dislike') map[l.resourceId]--;
      });
      return res.json({ success: true, likesMap: map });
    }

    const likes = await Like.find({ resourceId });
    const comments = await Comment.find({ resourceId }).sort({ createdAt: -1 });

    return res.json({ success: true, likes, comments });
  } catch (err) {
    console.error('Error in getInteractions:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch interactions' });
  }
};

// POST /api/interactions/comment/:commentId/like
exports.toggleCommentLike = async (req, res) => {
  try {
    const { userId, action } = req.body;
    const requestedAction = action || 'like';
    if (!userId) return res.status(400).json({ success: false, message: 'UserId is required' });

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const isLiked = comment.likes.includes(userId);
    const isDisliked = comment.dislikes.includes(userId);

    if (requestedAction === 'like') {
      if (isLiked) {
        comment.likes = comment.likes.filter((id) => id.toString() !== userId);
      } else {
        comment.likes.push(userId);
        comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId);
      }
    } else if (requestedAction === 'dislike') {
      if (isDisliked) {
        comment.dislikes = comment.dislikes.filter((id) => id.toString() !== userId);
      } else {
        comment.dislikes.push(userId);
        comment.likes = comment.likes.filter((id) => id.toString() !== userId);
      }
    }

    await comment.save();
    return res.json({ success: true, likes: comment.likes, dislikes: comment.dislikes });
  } catch (err) {
    console.error('Error toggling comment like:', err);
    return res.status(500).json({ success: false, message: 'Failed to toggle comment like' });
  }
};
