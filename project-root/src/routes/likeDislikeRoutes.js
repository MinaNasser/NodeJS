// likeDislikeRoutes.js placeholder
import express from 'express';
import {
  likeDislikeContent,
  getLikesDislikes,
} from '../controllers/likeDislikeController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const likeDislikeSchema = Joi.object({
  contentType: Joi.string().valid('video', 'comment', 'reply').required(),
  contentId: Joi.string().required(),
  type: Joi.string().valid('like', 'dislike').required(),
});

/**
 * @swagger
 * /api/likes:
 *   post:
 *     summary: Like or dislike content
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contentType
 *               - contentId
 *               - type
 *             properties:
 *               contentType:
 *                 type: string
 *                 enum: [video, comment, reply]
 *               contentId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [like, dislike]
 *     responses:
 *       200:
 *         description: Like/dislike added or removed
 *       404:
 *         description: Content not found
 */
router.post('/', protect, validateRequest(likeDislikeSchema), likeDislikeContent);

/**
 * @swagger
 * /api/likes/{contentType}/{contentId}:
 *   get:
 *     summary: Get likes/dislikes for content
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: contentType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [video, comment, reply]
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Likes/dislikes retrieved successfully
 */
router.get('/:contentType/:contentId', getLikesDislikes);

export default router; 