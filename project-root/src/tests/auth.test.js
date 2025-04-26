import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app.js';
import User from '../models/userModel.js';

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toEqual('testuser');
      expect(res.body.email).toEqual('test@example.com');
    });

    it('should not register a user with existing email', async () => {
      // Create a user first
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      // Create a user first
      const user = new User({
        username: 'loginuser',
        email: 'login@example.com',
        password: 'password123',
      });
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.username).toEqual('loginuser');
      expect(res.body.email).toEqual('login@example.com');
    });

    it('should not login a user with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      // Create a user and get token
      const user = new User({
        username: 'profileuser',
        email: 'profile@example.com',
        password: 'password123',
      });
      await user.save();

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'profile@example.com',
          password: 'password123',
        });

      const token = loginRes.body.token;

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.username).toEqual('profileuser');
      expect(res.body.email).toEqual('profile@example.com');
    });

    it('should not get profile without token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('Not authorized');
    });
  });
});