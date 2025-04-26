// commentRoutes.js placeholder
import express from 'express';
import {
  createComment,
  getCommentsByVideo,
  updateComment,
  deleteComment,
  createReply,
  getRepliesByComment,
  updateReply,
  deleteReply,
} from '../controllers/commentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const commentSchema = Joi.object({
  videoId: Joi.string().required(),
  text: Joi.string().required(),
});

const updateCommentSchema = Joi.object({
  text: Joi.string().required(),
});

const replySchema = Joi.object({
  text: Joi.string().required(),
});

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - videoId
 *               - text
 *             properties:
 *               videoId:
 *                 type: string
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       404:
 *         description: Video not found
 */
router.post('/', protect, validateRequest(commentSchema), createComment);

/**
 * @swagger
 * /api/comments/video/{videoId}:
 *   get:
 *     summary: Get comments for a video
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: videoId
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
 *         description: Comments retrieved successfully
 */
router.get('/video/:videoId', getCommentsByVideo);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 */
router.put('/:id', protect, validateRequest(updateCommentSchema), updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
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
 *         description: Comment removed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', protect, deleteComment);

/**
 * @swagger
 * /api/comments/{commentId}/replies:
 *   post:
 *     summary: Create a reply to a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reply created successfully
 *       404:
 *         description: Comment not found
 */
router.post('/:commentId/replies', protect, validateRequest(replySchema), createReply);

/**
 * @swagger
 * /api/comments/{commentId}/replies:
 *   get:
 *     summary: Get replies for a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: commentId
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
 *         description: Replies retrieved successfully
 */
router.get('/:commentId/replies', getRepliesByComment);

/**
 * @swagger
 * /api/comments/replies/{id}:
 *   put:
 *     summary: Update a reply
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reply updated successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Reply not found
 */
router.put('/replies/:id', protect, validateRequest(updateCommentSchema), updateReply);

/**
 * @swagger
 * /api/comments/replies/{id}:
 *   delete:
 *     summary: Delete a reply
 *     tags: [Comments]
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
 *         description: Reply removed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Reply not found
 */
router.delete('/replies/:id', protect, deleteReply);

export default router; 