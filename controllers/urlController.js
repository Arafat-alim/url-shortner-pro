// const useragent = require("useragent");
const Url = require("../models/Url");
const geoip = require("geoip-lite");
const { generateAlias } = require("../utils/generateAlias");
const redisClient = require("../config/redis");
const requestIp = require("request-ip");
const Analytic = require("../models/Analytic");
const urlService = require("../services/urlService");

exports.createShortUrl = async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;
    const userId = req.user.id;

    const newUrl = await urlService.createShortUrlService(
      longUrl,
      customAlias,
      topic,
      userId
    );

    return res.status(201).json({
      success: true,
      newUrl,
    });
  } catch (err) {
    console.error("Error creating short URL:", err);

    if (err.code === 11000 && err.keyPattern?.shortUrl) {
      return res.status(409).json({
        success: false,
        message: "Generated short URL already exists. Please try again.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to shorten the URL",
      error: err.message,
    });
  }
};

exports.redirectUrl = async (req, res) => {
  try {
    const { alias } = req.params;
    const ipAddress = requestIp.getClientIp(req) || "103.165.115.111";
    console.log(ipAddress);

    const url = await Url.findOne({ shortUrl: alias });
    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    //! Analytics Records
    // const agent = useragent.parse(req.headers["user-agent"]);
    const geo = geoip.lookup(ipAddress);

    //! Data
    const analyticsData = {
      urlId: url._id, // Link to the Url document
      timestamps: new Date(), // Store as Date object for easier querying/sorting
      ipAddress: ipAddress,
      userAgent: req.headers["user-agent"],
      osType: req.useragent.os || "Unknown",
      deviceType: req.useragent.isMobile ? "mobile" : "desktop",
      platform: req.useragent.platform || "Unknown",
      browser: req.useragent.browser || "Unknown",
      country: geo?.country || null,
      region: geo?.region || null,
      city: geo?.city || null,
    };

    // Save the analytics data to the Analytics collection
    const newAnalytics = new Analytic(analyticsData);
    await newAnalytics.save();

    // Increment the click count in the Url document
    url.clicks += 1;
    await url.save();

    const key = `shortUrl:${req.originalUrl}`;
    redisClient.del(key);

    //Invalidate cache for Overall Analytics
    const userKey = `overallAnalytics`;
    redisClient.del(userKey);

    const urlAnalyticsKey = `urlAnalytics:${alias}`;
    redisClient.del(urlAnalyticsKey);

    const topicAnalyticsKey = `topicAnalytics:${url.topic}`;
    redisClient.del(topicAnalyticsKey);

    res.redirect(url.longUrl);
  } catch (err) {
    console.error("Something went wrong while redirecting : ", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to redirect URL",
    });
  }
};
