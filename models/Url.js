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
    visitedHistory: [
      {
        timestamps: { type: Date },
        ipAddress: { type: String },
        userAgent: { type: String },
        osType: { type: String },
        deviceType: { type: String },
        platform: { type: String },
        browser: { type: String },
        country: { type: String },
        region: { type: String },
        city: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Url", urlSchema);
