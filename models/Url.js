const mongoose = require("mongoose");

const urlSchema = mongoose.Schema({
  //   userId: { type: mongoose.Schema.Types.ObjectId, ref: "Url" },
  userId: { type: String, ref: "Url" },
  customAlias: { type: String, unique: true, sparse: true },
  shortUrl: { type: String, required: true, unique: true },
  longUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Url", urlSchema);
