// likeDislikeController.js placeholder
import LikeDislike from '../models/likeDislikeModel.js';
import Video from '../models/videoModel.js';
import Comment from '../models/commentModel.js';
import Reply from '../models/replyModel.js';

// @desc    Like or dislike content (video, comment, reply)
// @route   POST /api/likes
// @access  Private
const likeDislikeContent = async (req, res) => {
  try {
    const { contentType, contentId, type } = req.body;

    // Validate content type
    if (!['video', 'comment', 'reply'].includes(contentType)) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    // Validate like/dislike type
    if (!['like', 'dislike'].includes(type)) {
      return res.status(400).json({ message: 'Invalid like/dislike type' });
    }

    // Check if content exists
    let content;
    let contentOwner;

    switch (contentType) {
      case 'video':
        content = await Video.findById(contentId);
        contentOwner = content ? content.user : null;
        break;
      case 'comment':
        content = await Comment.findById(contentId);
        contentOwner = content ? content.user : null;
        break;
      case 'reply':
        content = await Reply.findById(contentId);
        contentOwner = content ? content.user : null;
        break;
    }

    if (!content) {
      return res.status(404).json({ message: `${contentType} not found` });
    }

    // Check if user already liked/disliked this content
    const existingLikeDislike = await LikeDislike.findOne({
      user: req.user._id,
      contentType,
      contentId,
    });

    // If user already liked/disliked, update or remove
    if (existingLikeDislike) {
      if (existingLikeDislike.type === type) {
        // If same type, remove the like/dislike
        await existingLikeDislike.remove();
        
        // Update content like/dislike count
        if (type === 'like') {
          content.likesCount = Math.max(0, content.likesCount - 1);
        } else {
          content.dislikesCount = Math.max(0, content.dislikesCount - 1);
        }
        
        await content.save();
        
        return res.json({ message: `${type} removed` });
      } else {
        // If different type, update the type
        existingLikeDislike.type = type;
        await existingLikeDislike.save();
        
        // Update content like/dislike count
        if (type === 'like') {
          content.likesCount += 1;
          content.dislikesCount = Math.max(0, content.dislikesCount - 1);
        } else {
          content.dislikesCount += 1;
          content.likesCount = Math.max(0, content.likesCount - 1);
        }
        
        await content.save();
      }
    } else {
      // Create new like/dislike
      await LikeDislike.create({
        user: req.user._id,
        contentType,
        contentId,
        type,
      });
      
      // Update content like/dislike count
      if (type === 'like') {
        content.likesCount += 1;
      } else {
        content.dislikesCount += 1;
      }
      
      await content.save();
    }

    // Emit socket event for real-time notification
    if (req.io && contentOwner && contentOwner.toString() !== req.user._id.toString()) {
      req.io.to(contentOwner.toString()).emit('newLikeDislike', {
        type: 'likeDislike',
        contentType,
        contentId,
        likeDislikeType: type,
        from: {
          _id: req.user._id,
          username: req.user.username,
          profilePicture: req.user.profilePicture,
        },
      });
    }

    res.json({ message: `${type} added` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get likes/dislikes for content
// @route   GET /api/likes/:contentType/:contentId
// @access  Public
const getLikesDislikes = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;

    // Validate content type
    if (!['video', 'comment', 'reply'].includes(contentType)) {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    // Get likes count
    const likesCount = await LikeDislike.countDocuments({
      contentType,
      contentId,
      type: 'like',
    });

    // Get dislikes count
    const dislikesCount = await LikeDislike.countDocuments({
      contentType,
      contentId,
      type: 'dislike',
    });

    // Check if authenticated user has liked/disliked
    let userLikeDislike = null;
    if (req.user) {
      userLikeDislike = await LikeDislike.findOne({
        user: req.user._id,
        contentType,
        contentId,
      });
    }

    res.json({
      likesCount,
      dislikesCount,
      userLikeDislike: userLikeDislike ? userLikeDislike.type : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { likeDislikeContent, getLikesDislikes };