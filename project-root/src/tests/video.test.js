import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import User from '../models/userModel.js';
import Video from '../models/videoModel.js';
import path from 'path';
import fs from 'fs';
import { expect } from '@jest/globals';

describe('Video Controller', () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Create a test user and get token
    const user = await User.create({
      username: 'videouser',
      email: 'video@example.com',
      password: 'password123',
    });

    userId = user._id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'video@example.com',
        password: 'password123',
      });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await Video.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear videos collection before each test
    await Video.deleteMany({});
  });

  describe('GET /api/videos', () => {
    it('should get all public videos', async () => {
      // Create some test videos
      await Video.create([
        {
          title: 'Test Video 1',
          description: 'Test Description 1',
          filePath: '/videos/test1.mp4',
          user: userId,
          isPublic: true,
        },
        {
          title: 'Test Video 2',
          description: 'Test Description 2',
          filePath: '/videos/test2.mp4',
          user: userId,
          isPublic: true,
        },
        {
          title: 'Private Video',
          description: 'Private Description',
          filePath: '/videos/private.mp4',
          user: userId,
          isPublic: false,
        },
      ]);

      const res = await request(app).get('/api/videos');

      expect(res.statusCode).toEqual(200);
      expect(res.body.items.length).toEqual(2);
      expect(res.body.items[0].title).toContain('Test Video');
    });

    it('should filter videos by search term', async () => {
      // Create some test videos
      await Video.create([
        {
          title: 'Cooking Tutorial',
          description: 'Learn to cook pasta',
          filePath: '/videos/cooking.mp4',
          user: userId,
          isPublic: true,
          tags: ['cooking', 'food'],
        },
        {
          title: 'Gaming Stream',
          description: 'Playing new games',
          filePath: '/videos/gaming.mp4',
          user: userId,
          isPublic: true,
          tags: ['gaming', 'entertainment'],
        },
      ]);

      const res = await request(app).get('/api/videos?search=cooking');

      expect(res.statusCode).toEqual(200);
      expect(res.body.items.length).toEqual(1);
      expect(res.body.items[0].title).toEqual('Cooking Tutorial');
    });
  });

  describe('GET /api/videos/:id', () => {
    it('should get a video by ID', async () => {
      // Create a test video
      const video = await Video.create({
        title: 'Test Video',
        description: 'Test Description',
        filePath: '/videos/test.mp4',
        user: userId,
        isPublic: true,
      });

      const res = await request(app).get(`/api/videos/${video._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('Test Video');
      expect(res.body.description).toEqual('Test Description');
    });

    it('should return 404 for non-existent video', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/videos/${nonExistentId}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toContain('not found');
    });
  });

  describe('PUT /api/videos/:id', () => {
    it('should update a video', async () => {
      // Create a test video
      const video = await Video.create({
        title: 'Original Title',
        description: 'Original Description',
        filePath: '/videos/test.mp4',
        user: userId,
        isPublic: true,
      });

      const res = await request(app)
        .put(`/api/videos/${video._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('Updated Title');
      expect(res.body.description).toEqual('Updated Description');
    });

    it('should not update a video without authentication', async () => {
      // Create a test video
      const video = await Video.create({
        title: 'Original Title',
        description: 'Original Description',
        filePath: '/videos/test.mp4',
        user: userId,
        isPublic: true,
      });

      const res = await request(app)
        .put(`/api/videos/${video._id}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('Not authorized');
    });
  });
});