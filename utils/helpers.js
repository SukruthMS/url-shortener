const constants = require("./constants");

function generateShortId(count) {
  let c = count;
  let shortId = "";
  while (c > 0) {
    shortId = shortId + constants.chars.charAt(c % 62);
    c = Math.floor(c / 62);
  }
  return shortId;
}

function canMakeRequest(user, tierLimits) {
  return user.requestCount < tierLimits[user.tier];
}

// Helper function to validate URLs
function isValidUrl(urlString) {
  try {
    new URL(urlString); // The URL constructor will throw an error for invalid URLs
    return true;
  } catch (error) {
    return false;
  }
}

function getBaseUrl(req) {
  const protocol = req.protocol || "http";
  const host = req.get("host") || "localhost:3000";

  return `${protocol}://${host}`;
}

module.exports = { generateShortId, canMakeRequest, isValidUrl, getBaseUrl };
