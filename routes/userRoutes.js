const express = require("express");
const User = require("../models/user");
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  const { username, tier } = req.body;

  if (!username || !tier) {
    return res.status(400).send("Username and tier are required");
  }

  if (tier < 1 || tier > 5) {
    return res
      .status(400)
      .send("Invalid tier. Please choose a tier between 1 and 5.");
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).send("User already exists.");
    }

    const newUser = new User({ username, tier });
    await newUser.save();

    res.status(201).send("User registered successfully");
  } catch (error) {
    res.status(500).send("Error registering user: ", error);
  }
});

// User Information
router.get("/info", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).send("Username is required");
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json({
      tier: user.tier,
      totalRequests: user.requestCount,
      remainingRequests: user.getRemainingRequests(),
    });
  } catch (error) {
    res.status(500).send("Error fetching user details: ", error);
  }
});

module.exports = router;
