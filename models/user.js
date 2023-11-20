const mongoose = require("mongoose");
const constants = require("../utils/constants");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  tier: { type: Number, required: true },
  requestCount: { type: Number, default: 0 },
});

userSchema.methods.getRemainingRequests = function () {
  return Math.max(
    0,
    constants.tierLimits[this.tier] - this.requestCount
  );
};

module.exports = mongoose.model("User", userSchema);
