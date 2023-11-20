const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  count: { type: Number, default: 1 },
});

module.exports = mongoose.model("Counter", counterSchema);
