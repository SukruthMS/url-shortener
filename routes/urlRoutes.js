const express = require("express");
const Url = require("../models/url.js");
const User = require("../models/user.js");
const Counter = require("../models/counter.js");
const { generateShortId, canMakeRequest, isValidUrl, getBaseUrl } = require("../utils/helpers");
const router = express.Router();
const constants = require("../utils/constants.js");

/**
 * @route POST /shorten
 * @description Shortens a given URL.
 * @access Public
 * @param {string} username - Username of the user requesting URL shortening.
 * @param {string} longUrl - The original URL to be shortened.
 * @param {string} [preferredShortId] - Optional preferred short ID for the URL.
 * @returns {Object} JSON object containing the shortened URL and remaining request count.
 */
router.post("/shorten", async (req, res) => {
  const { username, longUrl, preferredShortId } = req.body;

  if (!username || !longUrl) {
    return res.status(400).send("Username and long URL are required");
  }

  // Validate the long URL
  if (!isValidUrl(longUrl)) {
    return res.status(400).send("Invalid URL provided");
  }

  try {
    let user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .send("User does not exist. Please register first.");
    }

    if (!canMakeRequest(user, constants.tierLimits)) {
      return res.status(429).json({
        message: "Request limit reached for your tier",
        remainingRequests: user.getRemainingRequests(),
      });
    }

    const baseUrl = getBaseUrl(req);

    // Retrieve or initialize the counter
    let counter = await Counter.findById("url_count");
    if (!counter) {
      counter = new Counter({ _id: "url_count" });
    }

    let shortId = preferredShortId;
    if (!shortId) {
      // Generate a unique shortId based on the counter
      do {
        shortId = generateShortId(counter.count);
        counter.count++;
      } while (await Url.findOne({ shortId }));
    } else if (await Url.findOne({ shortId })) {
      // If preferredShortId is already in use
      return res.status(409).send("Preferred short URL already in use");
    }

    await counter.save();

    const newUrl = new Url({ longUrl, shortId, username: user.username });
    await newUrl.save();
    user.requestCount++;
    await user.save();

    res.json({
      shortUrl: `${baseUrl}/${shortId}`,
      remainingRequests: user.getRemainingRequests(),
    });
  } catch (error) {
    res.status(500).send("Error shortening the long url: ", error);
  }
});

/**
 * @route GET /history
 * @description Retrieves the URL shortening history of a given user.
 * @access Public
 * @param {string} username - Username whose URL history is being requested.
 * @returns {Object} JSON object containing an array of URLs shortened by the user.
 */
router.get("/history", async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).send("Username is required");
  }

  try {
    const urls = await Url.find({ username: username }).select(
      "-_id longUrl shortId createdAt"
    );

    if (urls.length === 0) {
      return res.status(404).send("No URLs found for this user");
    }

    res.json(urls);
  } catch (error) {
    res
      .status(500)
      .send("Error fetching url history for the given user: ", error);
  }
});

module.exports = router;
