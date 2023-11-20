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

module.exports = { generateShortId, canMakeRequest };
