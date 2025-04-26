// follow.test.js placeholder
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import User from '../models/userModel.js';
import Follow from '../models/followModel.js';
import { expect, describe, beforeAll, afterAll, beforeEach, it } from '@jest/globals';

describe('Follow Controller', () => {
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
      username: 'followuser',
      email: 'follow@example.com',
      password: 'password123',
    });

    userId = user._id;

    // Create another user to follow
    const otherUser = await User.create({
      username: 'otherfollowuser',
      email: 'otherfollow@example.com',
      password: 'password123',
    });

    otherUserId = otherUser._id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'follow@example.com',
        password: 'password123',
      });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await Follow.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear follows collection before each test
    await Follow.deleteMany({});
  });

  describe('POST /api/follows', () => {
    it('should follow a user', async () => {
      const res = await request(app)
        .post('/api/follows')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: otherUserId,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.follower.toString()).toEqual(userId.toString());
      expect(res.body.following.toString()).toEqual(otherUserId.toString());
    });

    it('should not allow following yourself', async () => {
      const res = await request(app)
        .post('/api/follows')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: userId,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('cannot follow yourself');
    });

    it('should not allow following the same user twice', async () => {
      // First follow
      await request(app)
        .post('/api/follows')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: otherUserId,
        });

      // Try to follow again
      const res = await request(app)
        .post('/api/follows')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: otherUserId,
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Already following');
    });
  });

  describe('DELETE /api/follows/:userId', () => {
    it('should unfollow a user', async () => {
      // First follow
      await request(app)
        .post('/api/follows')
        .set('Authorization', `Bearer ${token}`)
        .send({
          userId: otherUserId,
        });

      // Then unfollow
      const res = await request(app)
        .delete(`/api/follows/${otherUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toContain('Unfollowed successfully');

      // Check if follow relationship was removed
      const follow = await Follow.findOne({
        follower: userId,
        following: otherUserId,
      });
      expect(follow).toBeNull();
    });

    it('should return error if not following the user', async () => {
      const res = await request(app)
        .delete(`/api/follows/${otherUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Not following this user');
    });
  });

  describe('GET /api/follows/followers/:userId', () => {
    it('should get followers of a user', async () => {
      // Create a follow relationship
      await Follow.create({
        follower: userId,
        following: otherUserId,
      });

      const res = await request(app).get(`/api/follows/followers/${otherUserId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].follower._id.toString()).toEqual(userId.toString());
    });
  });

  describe('GET /api/follows/following/:userId', () => {
    it('should get users followed by a user', async () => {
      // Create a follow relationship
      await Follow.create({
        follower: userId,
        following: otherUserId,
      });

      const res = await request(app).get(`/api/follows/following/${userId}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].following._id.toString()).toEqual(otherUserId.toString());
    });
  });

  describe('GET /api/follows/check/:userId', () => {
    it('should check if user is following another user', async () => {
      // Create a follow relationship
      await Follow.create({
        follower: userId,
        following: otherUserId,
      });

      const res = await request(app)
        .get(`/api/follows/check/${otherUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.following).toEqual(true);
    });

    it('should return false if not following', async () => {
      const res = await request(app)
        .get(`/api/follows/check/${otherUserId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.following).toEqual(false);
    });
  });
});