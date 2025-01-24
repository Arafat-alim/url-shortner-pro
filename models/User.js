const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  googleId: { type: String, required: true, uniqueId: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  // profile: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
