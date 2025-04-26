// comment.test.js placeholder
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import User from '../models/userModel.js';
import Video from '../models/videoModel.js';
import Comment from '../models/commentModel.js';
import Reply from '../models/replyModel.js';
import { expect } from '@jest/globals';

describe('Comment Controller', () => {
  let token;
  let userId;
  let videoId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user and get token
    const user = await User.create({
      username: 'commentuser',
      email: 'comment@example.com',
      password: 'password123',
    });

    userId = user._id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'comment@example.com',
        password: 'password123',
      });

    token = loginRes.body.token;

    // Create a test video
    const video = await Video.create({
      title: 'Test Video',
      description: 'Test Description',
      filePath: '/videos/test.mp4',
      user: userId,
      isPublic: true,
    });

    videoId = video._id;
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await Video.deleteMany({});
    await Comment.deleteMany({});
    await Reply.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear comments and replies collections before each test
    await Comment.deleteMany({});
    await Reply.deleteMany({});
  });

  describe('POST /api/comments', () => {
    it('should create a comment', async () => {
      const res = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({
          videoId: videoId,
          text: 'This is a test comment',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.text).toEqual('This is a test comment');
      expect(res.body.user._id.toString()).toEqual(userId.toString());
    });

    it('should not create a comment without authentication', async () => {
      const res = await request(app)
        .post('/api/comments')
        .send({
          videoId: videoId,
          text: 'This is a test comment',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('Not authorized');
    });
  });

  describe('GET /api/comments/video/:videoId', () => {
    it('should get comments for a video', async () => {
      // Create some test comments
      await Comment.create([
        {
          video: videoId,
          user: userId,
          text: 'Comment 1',
        },
        {
          video: videoId,
          user: userId,
          text: 'Comment 2',
        },
      ]);

      const res = await request(app).get(`/api/comments/video/${videoId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.items.length).toEqual(2);
      expect(res.body.items[0].text).toContain('Comment');
    });
  });

  describe('POST /api/comments/:commentId/replies', () => {
    it('should create a reply to a comment', async () => {
      // Create a test comment
      const comment = await Comment.create({
        video: videoId,
        user: userId,
        text: 'Parent Comment',
      });

      const res = await request(app)
        .post(`/api/comments/${comment._id}/replies`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'This is a reply',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.text).toEqual('This is a reply');
      expect(res.body.comment.toString()).toEqual(comment._id.toString());
    });
  });

  describe('GET /api/comments/:commentId/replies', () => {
    it('should get replies for a comment', async () => {
      // Create a test comment
      const comment = await Comment.create({
        video: videoId,
        user: userId,
        text: 'Parent Comment',
      });

      // Create some test replies
      await Reply.create([
        {
          comment: comment._id,
          user: userId,
          text: 'Reply 1',
        },
        {
          comment: comment._id,
          user: userId,
          text: 'Reply 2',
        },
      ]);

      const res = await request(app).get(`/api/comments/${comment._id}/replies`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.items.length).toEqual(2);
      expect(res.body.items[0].text).toContain('Reply');
    });
  });
});