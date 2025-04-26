// videoRoutes.js placeholder
import express from 'express';
import {
  uploadVideo,
  getVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getVideosByUser,
} from '../controllers/videoController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import { uploadLocal } from '../utils/fileUpload.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const updateVideoSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string(),
  tags: Joi.string(),
  isPublic: Joi.boolean(),
});

/**
 * @swagger
 * /api/videos:
 *   post:
 *     summary: Upload a new video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *               useCloudStorage:
 *                 type: boolean
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Video uploaded successfully
 *       400:
 *         description: Invalid video data
 */
router.post('/', protect, uploadLocal.single('file'), uploadVideo);

/**
 * @swagger
 * /api/videos:
 *   get:
 *     summary: Get all videos with pagination
 *     tags: [Videos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
 */
router.get('/', getVideos);

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     summary: Get a video by ID
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *       404:
 *         description: Video not found
 */
router.get('/:id', getVideoById);

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     summary: Update a video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               tags:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Video not found
 */
router.put('/:id', protect, validateRequest(updateVideoSchema), updateVideo);

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     summary: Delete a video
 *     tags: [Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Video removed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Video not found
 */
router.delete('/:id', protect, deleteVideo);

/**
 * @swagger
 * /api/videos/user/{userId}:
 *   get:
 *     summary: Get videos by user
 *     tags: [Videos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/user/:userId', getVideosByUser);

export default router;