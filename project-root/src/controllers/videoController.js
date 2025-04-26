// videoController.js placeholder
import Video from '../models/videoModel.js';
import { uploadToCloud, processVideo } from '../utils/fileUpload.js';
import { getPagination, getPagingData } from '../utils/helperFunctions.js';
import fs from 'fs';
import path from 'path';

// @desc    Upload a video
// @route   POST /api/videos
// @access  Private
const uploadVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a video file' });
    }

    const { title, description, tags, isPublic } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.filename;

    // Process video (generate thumbnail and get duration)
    const { thumbnailPath, duration } = await processVideo(filePath);

    // Upload to cloud storage if specified
    let videoUrl = filePath;
    let thumbnailUrl = thumbnailPath;

    if (req.body.useCloudStorage === 'true') {
      videoUrl = await uploadToCloud(filePath, `videos/${fileName}`);
      thumbnailUrl = await uploadToCloud(thumbnailPath, `thumbnails/${path.basename(thumbnailPath)}`);
    }

    // Create video in database
    const video = await Video.create({
      title,
      description,
      filePath: videoUrl,
      thumbnailPath: thumbnailUrl,
      user: req.user._id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      duration,
      isPublic: isPublic === 'true',
    });

    res.status(201).json(video);
  } catch (error) {
    // Clean up files if error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all videos with pagination
// @route   GET /api/videos
// @access  Public
const getVideos = async (req, res) => {
  try {
    const { page, size, search, tag } = req.query;
    const { limit, offset } = getPagination(page, size);

    // Build query
    let query = { isPublic: true };

    // Add search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Get videos with pagination
    const count = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    const response = getPagingData({ count, rows: videos }, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single video
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('user', 'username profilePicture');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Increment view count
    video.views += 1;
    await video.save();

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a video
// @route   PUT /api/videos/:id
// @access  Private
const updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user owns the video
    if (video.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update fields
    video.title = req.body.title || video.title;
    video.description = req.body.description || video.description;
    video.isPublic = req.body.isPublic !== undefined ? req.body.isPublic : video.isPublic;
    
    if (req.body.tags) {
      video.tags = req.body.tags.split(',').map(tag => tag.trim());
    }

    const updatedVideo = await video.save();
    res.json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a video
// @route   DELETE /api/videos/:id
// @access  Private
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Check if user owns the video or is admin
    if (video.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Delete video file if it's stored locally
    if (video.filePath.startsWith('public/')) {
      fs.unlinkSync(video.filePath);
      
      // Delete thumbnail if it exists
      if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
        fs.unlinkSync(video.thumbnailPath);
      }
    }

    // Delete from database
    await video.remove();
    res.json({ message: 'Video removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get videos by user
// @route   GET /api/videos/user/:userId
// @access  Public
const getVideosByUser = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);

    const query = { 
      user: req.params.userId,
      isPublic: true 
    };

    // If the requesting user is the owner, show private videos too
    if (req.user && req.user._id.toString() === req.params.userId) {
      delete query.isPublic;
    }

    const count = await Video.countDocuments(query);
    const videos = await Video.find(query)
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    const response = getPagingData({ count, rows: videos }, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  uploadVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getVideosByUser,
};