const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/user');
require('../models/url');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(process.env.MONGODB_URI)
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('User Registration', () => {
  test('should register a user successfully', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({ username: 'testuser', tier: 1 });
    
    expect(response.statusCode).toBe(201);
    expect(response.text).toBe("User registered successfully");
  });

  test('should require username and tier', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({});
    
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Username and tier are required");
  });

  test('should not allow registration with invalid tier', async () => {
    const response = await request(app)
      .post('/user/register')
      .send({ username: 'testuser2', tier: 6 }); // Invalid tier
    
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Invalid tier. Please choose a tier between 1 and 5.");
  });

  test('should not allow duplicate user registration', async () => {
    // First registration attempt
    await request(app)
      .post('/user/register')
      .send({ username: 'duplicateUser', tier: 1 });

    // Second registration attempt with the same username
    const response = await request(app)
      .post('/user/register')
      .send({ username: 'duplicateUser', tier: 1 });
    
    expect(response.statusCode).toBe(409);
    expect(response.text).toBe("User already exists.");
  });
});

describe('User Information', () => {
  test('should retrieve user information', async () => {
    const user = new User({ username: 'testuser', tier: 1 });
    await user.save();
    
    const response = await request(app)
      .get('/user/info')
      .query({ username: 'testuser' });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      tier: 1,
      totalRequests: expect.any(Number),
      remainingRequests: expect.any(Number),
    }));
  });

  test('should return error for non-existent user', async () => {
    const response = await request(app)
      .get('/user/info')
      .query({ username: 'nonexistent' });
    
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("User not found");
  });

  test('should return an error if username parameter is missing', async () => {
    const response = await request(app)
      .get('/user/info')
      // Not providing the username query parameter
      .query({});
    
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Username is required");
  });
});
