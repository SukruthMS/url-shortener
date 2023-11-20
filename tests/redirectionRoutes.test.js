const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Url = require('../models/url');
const User = require('../models/user');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(process.env.MONGODB_URI);

  // Create a test user
  const testUser = new User({
    username: 'testUser',
    tier: 1
  });
  await testUser.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Seed the database with a URL entry
  const seedUrl = new Url({
    longUrl: 'https://www.example.com',
    shortId: 'exmpl',
    username: 'testUser' // Using the test user's username
  });
  await seedUrl.save();
});

afterEach(async () => {
  await Url.deleteMany({});
  await User.deleteMany({});
});

describe('URL Redirection', () => {
  it('redirects to the correct long URL for a valid short ID', async () => {
    const shortId = 'exmpl';
    const response = await request(app).get(`/${shortId}`);
    
    expect(response.statusCode).toBe(302); // Check for redirection status code
    expect(response.header.location).toBe('https://www.example.com'); // URL to which it should redirect
  });

  it('responds with 404 Not Found for a non-existent short ID', async () => {
    const shortId = 'nonexistent';
    const response = await request(app).get(`/${shortId}`);
    
    expect(response.statusCode).toBe(404);
    expect(response.text).toBe('URL not found');
  });
});
