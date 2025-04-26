// notification.test.js placeholder
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import User from '../models/userModel.js';
import { expect, describe, beforeAll, afterAll, beforeEach, it } from '@jest/globals';

// Import the Notification model from the controller since it's defined there
import { createNotification } from '../controllers/notificationController.js';
const Notification = mongoose.model('Notification');

describe('Notification Controller', () => {
  let token;
  let userId;
  let otherUserId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user and get token
    const user = await User.create({
      username: 'notifuser',
      email: 'notif@example.com',
      password: 'password123',
    });

    userId = user._id;

    // Create another user
    const otherUser = await User.create({
      username: 'othernotifuser',
      email: 'othernotif@example.com',
      password: 'password123',
    });

    otherUserId = otherUser._id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'notif@example.com',
        password: 'password123',
      });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await Notification.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear notifications collection before each test
    await Notification.deleteMany({});
  });

  describe('POST /api/notifications', () => {
    it('should create a notification', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipientId: otherUserId,
          type: 'comment',
          contentType: 'video',
          contentId: new mongoose.Types.ObjectId(),
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.recipient.toString()).toEqual(otherUserId.toString());
      expect(res.body.sender.toString()).toEqual(userId.toString());
      expect(res.body.type).toEqual('comment');
    });

    it('should not create notification if sender is recipient', async () => {
      const res = await request(app)
        .post('/api/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipientId: userId,
          type: 'comment',
          contentType: 'video',
          contentId: new mongoose.Types.ObjectId(),
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Self notification skipped');
    });
  });

  describe('GET /api/notifications', () => {
    it('should get notifications for a user', async () => {
      // Create some test notifications
      await Notification.create([
        {
          recipient: userId,
          sender: otherUserId,
          type: 'comment',
          contentType: 'video',
          contentId: new mongoose.Types.ObjectId(),
        },
        {
          recipient: userId,
          sender: otherUserId,
          type: 'like',
          contentType: 'comment',
          contentId: new mongoose.Types.ObjectId(),
        },
      ]);

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(2);
      expect(res.body[0].recipient.toString()).toEqual(userId.toString());
    });
  });

  describe('PUT /api/notifications/:id', () => {
    it('should mark notification as read', async () => {
      // Create a test notification
      const notification = await Notification.create({
        recipient: userId,
        sender: otherUserId,
        type: 'comment',
        contentType: 'video',
        contentId: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .put(`/api/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.read).toEqual(true);
    });

    it('should not allow marking someone else\'s notification as read', async () => {
      // Create a test notification for another user
      const notification = await Notification.create({
        recipient: otherUserId,
        sender: userId,
        type: 'comment',
        contentType: 'video',
        contentId: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .put(`/api/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('User not authorized');
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should mark all notifications as read', async () => {
      // Create some test notifications
      await Notification.create([
        {
          recipient: userId,
          sender: otherUserId,
          type: 'comment',
          contentType: 'video',
          contentId: new mongoose.Types.ObjectId(),
        },
        {
          recipient: userId,
          sender: otherUserId,
          type: 'like',
          contentType: 'comment',
          contentId: new mongoose.Types.ObjectId(),
        },
      ]);

      const res = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('All notifications marked as read');

      // Check if notifications were updated
      const notifications = await Notification.find({ recipient: userId });
      expect(notifications.every(n => n.read === true)).toEqual(true);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete a notification', async () => {
      // Create a test notification
      const notification = await Notification.create({
        recipient: userId,
        sender: otherUserId,
        type: 'comment',
        contentType: 'video',
        contentId: new mongoose.Types.ObjectId(),
      });

      const res = await request(app)
        .delete(`/api/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Notification removed');

      // Check if notification was deleted
      const deletedNotification = await Notification.findById(notification._id);
      expect(deletedNotification).toBeNull();
    });
  });
});