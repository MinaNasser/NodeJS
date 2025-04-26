// commentController.js placeholder
import Comment from '../models/commentModel.js';
import Reply from '../models/replyModel.js';
import Video from '../models/videoModel.js';
import { getPagination, getPagingData } from '../utils/helperFunctions.js';

// @desc    Create a comment
// @route   POST /api/comments
// @access  Private
const createComment = async (req, res) => {
  try {
    const { videoId, text } = req.body;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Create comment
    const comment = await Comment.create({
      video: videoId,
      user: req.user._id,
      text,
    });

    // Populate user data
    const populatedComment = await Comment.findById(comment._id).populate('user', 'username profilePicture');

    // Emit socket event for real-time notification
    if (req.io && video.user.toString() !== req.user._id.toString()) {
      req.io.to(video.user.toString()).emit('newComment', {
        type: 'comment',
        content: populatedComment,
        from: {
          _id: req.user._id,
          username: req.user.username,
          profilePicture: req.user.profilePicture,
        },
      });
    }

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a video
// @route   GET /api/comments/video/:videoId
// @access  Public
const getCommentsByVideo = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const count = await Comment.countDocuments({ video: req.params.videoId });
    const comments = await Comment.find({ video: req.params.videoId })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    const response = getPagingData({ count, rows: comments }, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update comment
    comment.text = req.body.text || comment.text;
    const updatedComment = await comment.save();

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete all replies to this comment
    await Reply.deleteMany({ comment: comment._id });

    // Delete comment
    await comment.remove();
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a reply to a comment
// @route   POST /api/comments/:commentId/replies
// @access  Private
const createReply = async (req, res) => {
  try {
    const { text } = req.body;
    const commentId = req.params.commentId;

    // Check if comment exists
    const comment = await Comment.findById(commentId).populate('user', 'username');
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Create reply
    const reply = await Reply.create({
      comment: commentId,
      user: req.user._id,
      text,
    });

    // Populate user data
    const populatedReply = await Reply.findById(reply._id).populate('user', 'username profilePicture');

    // Emit socket event for real-time notification
    if (req.io && comment.user._id.toString() !== req.user._id.toString()) {
      req.io.to(comment.user._id.toString()).emit('newReply', {
        type: 'reply',
        content: populatedReply,
        from: {
          _id: req.user._id,
          username: req.user.username,
          profilePicture: req.user.profilePicture,
        },
      });
    }

    res.status(201).json(populatedReply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get replies for a comment
// @route   GET /api/comments/:commentId/replies
// @access  Public
const getRepliesByComment = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const count = await Reply.countDocuments({ comment: req.params.commentId });
    const replies = await Reply.find({ comment: req.params.commentId })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(offset);

    const response = getPagingData({ count, rows: replies }, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a reply
// @route   PUT /api/comments/replies/:id
// @access  Private
const updateReply = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check if user owns the reply
    if (reply.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update reply
    reply.text = req.body.text || reply.text;
    const updatedReply = await reply.save();

    res.json(updatedReply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a reply
// @route   DELETE /api/comments/replies/:id
// @access  Private
const deleteReply = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);

    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Check if user owns the reply or is admin
    if (reply.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete reply
    await reply.remove();
    res.json({ message: 'Reply removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createComment,
  getCommentsByVideo,
  updateComment,
  deleteComment,
  createReply,
  getRepliesByComment,
  updateReply,
  deleteReply,
};