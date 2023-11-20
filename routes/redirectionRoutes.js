const express = require("express");
const Url = require("../models/url.js");
const router = express.Router();

// URL Redirection
router.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;

  try {
    const urlEntry = await Url.findOne({ shortId });

    if (urlEntry) {
      // Redirect to the original (long) URL
      return res.redirect(urlEntry.longUrl);
    } else {
      // If no URL is found, send a 404 Not Found response
      return res.status(404).send("URL not found");
    }
  } catch (error) {
    console.error(error);
    // Handle any other errors
    res.status(500).send("Internal server error");
  }
});

module.exports = router;