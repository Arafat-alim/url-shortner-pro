const mongoose = require("mongoose");

const urlSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customAlias: { type: String, unique: true, sparse: true },
    shortUrl: { type: String, required: true, unique: true },
    longUrl: { type: String, required: true },
    topic: { type: String, required: true },
    clicks: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Url", urlSchema);
