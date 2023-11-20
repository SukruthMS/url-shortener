const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Url = require("../models/url");
const User = require("../models/user");
const Counter = require("../models/counter");
const constants = require("../utils/constants");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("/shorten", () => {
  // Setup a user for testing URL shortening
  const username = `testUser`;
  beforeAll(async () => {
    const user = new User({ username, tier: 1 });
    await user.save();
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  it("should shorten a valid URL", async () => {
    const longUrl = "https://www.example.com";
    const response = await request(app)
      .post("/url/shorten")
      .send({ username, longUrl });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("shortUrl");
  });

  it("should not shorten an invalid URL", async () => {
    const longUrl = "invalidurl";
    const response = await request(app)
      .post("/url/shorten")
      .send({ username, longUrl });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Invalid URL provided");
  });

  it("should not shorten a URL for a non-existent user", async () => {
    const longUrl = "https://www.example.com";
    const response = await request(app)
      .post("/url/shorten")
      .send({ username: "nonExistentUser", longUrl });

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("User does not exist. Please register first.");
  });

  // Test case: Missing longUrl field
  it("should not shorten a URL without a longUrl field", async () => {
    const response = await request(app).post("/url/shorten").send({ username });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Username and long URL are required");
  });

  // Test case: Missing username field
  it("should not shorten a URL without a username field", async () => {
    const response = await request(app)
      .post("/url/shorten")
      .send({ longUrl: "https://www.example.com" });

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Username and long URL are required");
  });
});

describe("/shorten", () => {
  const username = "testUser1";
  beforeAll(async () => {
    await new User({ username, tier: 1, requestCount: 0 }).save();
    await new Counter({ _id: "url_count", count: 1 }).save();
  });

  // Test case: Reject shortening if tier limit is reached
  it("should not shorten a URL if the user has reached the tier limit", async () => {
    const user = await User.findOne({ username });
    user.requestCount = constants.tierLimits[user.tier]; // Set the user's request count to their tier limit
    await user.save();

    const response = await request(app)
      .post("/url/shorten")
      .send({ username, longUrl: "https://www.example.com" });

    expect(response.statusCode).toBe(429);
    expect(response.body.message).toBe("Request limit reached for your tier");
  });
});

describe("/shorten", () => {
  const username = "testUser2";
  beforeAll(async () => {
    await new User({ username, tier: 1, requestCount: 0 }).save();
    await new Counter({ _id: "url_count", count: 1 }).save();
  });

  // Test case: Reject shortening if preferredShortId is already used
  it("should not shorten a URL if the preferredShortId is already in use", async () => {
    // Save a URL with a specific preferredShortId
    await new Url({
      longUrl: "https://www.anotherexample.com",
      shortId: "xyz789",
      username: username,
    }).save();
    const response = await request(app).post("/url/shorten").send({
      username,
      longUrl: "https://www.example.com",
      preferredShortId: "xyz789",
    });

    expect(response.statusCode).toBe(409);
    expect(response.text).toBe("Preferred short URL already in use");
  });
});

describe("/history", () => {
  const username = "historyUser";
  beforeAll(async () => {
    const user = new User({ username, tier: 1 });
    await user.save();
    const url = new Url({
      longUrl: "https://www.example.com",
      shortId: "abc123",
      username: username,
    });
    await url.save();
  });

  it("should retrieve the URL history for an existing user", async () => {
    const response = await request(app).get("/url/history").query({ username });

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should return 404 for a user with no URL history", async () => {
    const response = await request(app)
      .get("/url/history")
      .query({ username: "newUser" });

    expect(response.statusCode).toBe(404);
    expect(response.text).toBe("No URLs found for this user");
  });

  it("should return 400 if username is not provided", async () => {
    const response = await request(app).get("/url/history");

    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("Username is required");
  });
});
