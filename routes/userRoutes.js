const express = require("express");
const User = require("../models/user");
const router = express.Router();

/**
 * Registers a new user.
 * @route POST /register
 * @param {string} req.body.username - The username of the new user.
 * @param {number} req.body.tier - The tier of the new user (must be between 1 and 5).
 * @returns {Object} 201 - Registration successful message.
 * @returns {Object} 400 - Error message for missing/invalid input.
 * @returns {Object} 409 - Error message for existing username.
 * @returns {Object} 500 - Server error message.
 */
router.post("/register", async (req, res) => {
  // Destructuring the request body
  const { username, tier } = req.body;

  // Validate username and tier
  if (!username || !tier) {
    return res.status(400).send("Username and tier are required");
  }

  // Validate tier range
  if (tier < 1 || tier > 5) {
    return res
      .status(400)
      .send("Invalid tier. Please choose a tier between 1 and 5.");
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).send("User already exists.");
    }

    // Create a new user
    const newUser = new User({ username, tier });
    await newUser.save();

    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(500).send("Error registering user: " + error);
  }
});

/**
 * Retrieves information about a user.
 * @route GET /info
 * @param {string} req.query.username - The username to lookup.
 * @returns {Object} 200 - User information including tier, total and remaining requests.
 * @returns {Object} 400 - Error message for missing username.
 * @returns {Object} 404 - Error message for user not found.
 * @returns {Object} 500 - Server error message.
 */
router.get("/info", async (req, res) => {
  // Extracting username from the request query
  const username = req.query.username;

  // Validate username
  if (!username) {
    return res.status(400).send("Username is required");
  }

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    // Check if the user exists
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Respond with user information
    res.json({
      tier: user.tier,
      totalRequests: user.requestCount,
      remainingRequests: user.getRemainingRequests(),
    });
  } catch (error) {
    res.status(500).send("Error fetching user details: " + error);
  }
});

module.exports = router;
