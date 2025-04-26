// followRoutes.js placeholder
import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkFollowing,
} from '../controllers/followController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const followSchema = Joi.object({
  userId: Joi.string().required(),
});

/**
 * @swagger
 * /api/follows:
 *   post:
 *     summary: Follow a user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Follow relationship created
 *       400:
 *         description: Already following this user
 *       404:
 *         description: User not found
 */
router.post('/', protect, validateRequest(followSchema), followUser);

/**
 * @swagger
 * /api/follows/{userId}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unfollowed successfully
 *       400:
 *         description: Not following this user
 *       404:
 *         description: User not found
 */
router.delete('/:userId', protect, unfollowUser);

/**
 * @swagger
 * /api/follows/followers/{userId}:
 *   get:
 *     summary: Get followers of a user
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Followers retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/followers/:userId', getFollowers);

/**
 * @swagger
 * /api/follows/following/{userId}:
 *   get:
 *     summary: Get users followed by a user
 *     tags: [Follows]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Following retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/following/:userId', getFollowing);

/**
 * @swagger
 * /api/follows/check/{userId}:
 *   get:
 *     summary: Check if user is following another user
 *     tags: [Follows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow status retrieved
 */
router.get('/check/:userId', protect, checkFollowing);

export default router;