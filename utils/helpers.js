const constants = require("./constants");

/**
 * Generates a short ID based on the given count.
 *
 * @param {number} count - The count used to generate the short ID.
 * @returns {string} The generated short ID.
 */
function generateShortId(count) {
  let c = count;
  let shortId = "";
  while (c > 0) {
    shortId = shortId + constants.chars.charAt(c % 62);
    c = Math.floor(c / 62);
  }
  return shortId;
}

/**
 * Checks if a user can make a request based on their tier limits.
 *
 * @param {object} user - The user object.
 * @param {object} tierLimits - The tier limits object.
 * @returns {boolean} True if the user can make a request; otherwise, false.
 */
function canMakeRequest(user, tierLimits) {
  return user.requestCount < tierLimits[user.tier];
}

/**
 * Helper function to validate URLs.
 *
 * @param {string} urlString - The URL string to validate.
 * @returns {boolean} True if the URL is valid; otherwise, false.
 */
function isValidUrl(urlString) {
  try {
    new URL(urlString); // The URL constructor will throw an error for invalid URLs
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets the base URL from the request object.
 *
 * @param {object} req - The request object.
 * @returns {string} The base URL.
 */
function getBaseUrl(req) {
  const protocol = req.protocol || "http";
  const host = req.get("host") || "localhost:3000";

  return `${protocol}://${host}`;
}

module.exports = { generateShortId, canMakeRequest, isValidUrl, getBaseUrl };
