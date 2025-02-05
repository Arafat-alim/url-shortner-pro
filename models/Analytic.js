const mongoose = require("mongoose");

const analyticSchema = mongoose.Schema(
  {
    urlId: { type: mongoose.Schema.ObjectId, ref: "Url", required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    osType: { type: String, required: true }, //
    deviceType: { type: String, required: true },
    platform: { type: String },
    browser: { type: String },
    country: { type: String },
    region: { type: String },
    city: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analytic", analyticSchema);
