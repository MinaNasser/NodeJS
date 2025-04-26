// likeDislike.test.js placeholder
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import User from '../models/userModel.js';
import Video from '../models/videoModel.js';
import Comment from '../models/commentModel.js';
import LikeDislike from '../models/likeDislikeModel.js';
import { expect, describe, beforeAll, afterAll, beforeEach, it } from '@jest/globals';

describe('LikeDislike Controller', () => {
  let token;
  let userId;
  let videoId;
  let commentId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user and get token
    const user = await User.create({
      username: 'likeuser',
      email: 'like@example.com',
      password: 'password123',
    });

    userId = user._id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'like@example.com',
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

    // Create a test comment
    const comment = await Comment.create({
      video: videoId,
      user: userId,
      text: 'Test Comment',
    });

    commentId = comment._id;
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await Video.deleteMany({});
    await Comment.deleteMany({});
    await LikeDislike.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear likes/dislikes collection before each test
    await LikeDislike.deleteMany({});
  });

  describe('POST /api/likes', () => {
    it('should like a video', async () => {
      const res = await request(app)
        .post('/api/likes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'video',
          contentId: videoId,
          type: 'like',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('like added');

      // Check if video likes count was updated
      const video = await Video.findById(videoId);
      expect(video.likesCount).toEqual(1);
    });

    it('should dislike a comment', async () => {
      const res = await request(app)
        .post('/api/likes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'comment',
          contentId: commentId,
          type: 'dislike',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('dislike added');

      // Check if comment dislikes count was updated
      const comment = await Comment.findById(commentId);
      expect(comment.dislikesCount).toEqual(1);
    });

    it('should remove like if same type is sent again', async () => {
      // First like the video
      await request(app)
        .post('/api/likes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'video',
          contentId: videoId,
          type: 'like',
        });

      // Like again to remove
      const res = await request(app)
        .post('/api/likes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'video',
          contentId: videoId,
          type: 'like',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('like removed');

      // Check if video likes count was updated
      const video = await Video.findById(videoId);
      expect(video.likesCount).toEqual(0);
    });

    it('should change from like to dislike', async () => {
      // First like the video
      await request(app)
        .post('/api/likes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'video',
          contentId: videoId,
          type: 'like',
        });

      // Then dislike to change
      const res = await request(app)
        .post('/api/likes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          contentType: 'video',
          contentId: videoId,
          type: 'dislike',
        });

      expect(res.statusCode).toEqual(200);

      // Check if video likes/dislikes count was updated
      const video = await Video.findById(videoId);
      expect(video.likesCount).toEqual(0);
      expect(video.dislikesCount).toEqual(1);
    });
  });

  describe('GET /api/likes/:contentType/:contentId', () => {
    it('should get likes/dislikes for content', async () => {
      // Create a like
      await LikeDislike.create({
        user: userId,
        contentType: 'video',
        contentId: videoId,
        type: 'like',
      });

      const res = await request(app).get(`/api/likes/video/${videoId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.likesCount).toEqual(1);
      expect(res.body.dislikesCount).toEqual(0);
    });

    it('should include user like/dislike status if authenticated', async () => {
      // Create a like
      await LikeDislike.create({
        user: userId,
        contentType: 'video',
        contentId: videoId,
        type: 'like',
      });

      const res = await request(app)
        .get(`/api/likes/video/${videoId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.likesCount).toEqual(1);
      expect(res.body.userLikeDislike).toEqual('like');
    });
  });
});