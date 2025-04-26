// notificationRoutes.js placeholder
import express from 'express';
import {
  createNotification,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import validateRequest from '../middlewares/validateRequest.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const notificationSchema = Joi.object({
  recipientId: Joi.string().required(),
  type: Joi.string().valid('comment', 'reply', 'like', 'dislike', 'follow', 'video').required(),
  contentType: Joi.string().valid('video', 'comment', 'reply', 'user').required(),
  contentId: Joi.string().required(),
});

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - type
 *               - contentType
 *               - contentId
 *             properties:
 *               recipientId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [comment, reply, like, dislike, follow, video]
 *               contentType:
 *                 type: string
 *                 enum: [video, comment, reply, user]
 *               contentId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
 */
router.post('/', protect, validateRequest(notificationSchema), createNotification);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get notifications for a user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get('/', protect, getNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
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
 *         description: Notification marked as read
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Notification not found
 */
router.put('/:id', protect, markNotificationAsRead);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/read-all', protect, markAllNotificationsAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
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
 *         description: Notification removed
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Notification not found
 */
router.delete('/:id', protect, deleteNotification);

export default router;