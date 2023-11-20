const express = require("express");
const Url = require("../models/url.js");
const router = express.Router();

/**
 * Route serving URL redirection.
 * @name get/:shortId
 * @function
 * @memberof module:router
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 * @description Redirects to the original (long) URL based on the provided shortId.
 *              If the shortId does not correspond to an existing URL entry,
 *              responds with a 404 Not Found error. For any other errors,
 *              responds with a 500 Internal Server Error.
 */
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