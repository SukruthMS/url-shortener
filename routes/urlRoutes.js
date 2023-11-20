const express = require("express");
const Url = require("../models/url.js");
const User = require("../models/user.js");
const Counter = require("../models/counter.js");
const { generateShortId, canMakeRequest } = require("../utils/helpers");
const router = express.Router();
const constants = require("../utils/constants.js");

// URL Shortening
router.post("/shorten", async (req, res) => {
  const {
    username,
    longUrl,
    usePreferredUrl,
    preferredDomain,
    preferredShortId,
  } = req.body;

  if (!username || !longUrl) {
    return res.status(400).send("Username and long URL are required");
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

    let shortUrl;
    if (usePreferredUrl) {
      if (!preferredShortId) {
        return res.status(400).send("Preferred short ID is required");
      }
      const fullPreferredUrl = preferredDomain
        ? preferredDomain + preferredShortId
        : constants.shortUrlPrefix + preferredShortId;

      if (fullPreferredUrl.length >= longUrl.length) {
        return res
          .status(400)
          .send(
            "Length of short URL should not be greater than or equal to length of long URL"
          );
      }

      if (await Url.findOne({ shortId: preferredShortId })) {
        return res.status(409).send("Preferred short URL already in use");
      }

      shortUrl = fullPreferredUrl;
    } else {
      // Retrieve or initialize the counter
      let counter = await Counter.findById("url_count");
      if (!counter) {
        counter = new Counter({ _id: "url_count" });
      }

      // Generate a unique shortId based on the counter
      do {
        shortId = generateShortId(counter.count);
        counter.count++;
      } while (await Url.findOne({ shortId: shortId }));

      await counter.save();
      shortUrl = constants.shortUrlPrefix + shortId;
    }

    const newUrl = new Url({
      longUrl,
      shortId: shortUrl.replace(constants.shortUrlPrefix, ""),
      username: user.username,
    });
    await newUrl.save();
    user.requestCount++;
    await user.save();

    res.json({
      shortUrl: shortUrl,
      remainingRequests: user.getRemainingRequests(),
    });
  } catch (error) {
    res.status(500).send("Error shortening the long url: " + error);
  }
});

// URL Redirection
router.get("/redirect", async (req, res) => {
  try {
    const shortId = req.query.shortId;
    const url = await Url.findOne({ shortId });

    if (url) {
      res.json({longUrl : url.longUrl});
    } else {
      res.status(404).send("URL not found");
    }
  } catch (error) {
    res
      .status(500)
      .send("Error finding long url corresponding to input short url: ", error);
  }
});

// User URL History
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
