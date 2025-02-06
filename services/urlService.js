const Url = require("../models/Url");
const Analytic = require("../models/Analytic");
const { generateAlias } = require("../utils/generateAlias");
const redisClient = require("../config/redis");
const cacheService = require("../services/cacheService");

// Create a short URL
exports.createShortUrlService = async (longUrl, customAlias, topic, userId) => {
  if (!longUrl) {
    throw new Error("URL is required");
  }

  let shortUrl = customAlias || generateAlias();
  let attempts = 0;
  const maxAttempts = 3;

  let isAliasFind;

  do {
    isAliasFind = await Url.findOne({ shortUrl });

    if (isAliasFind) {
      if (customAlias) {
        throw new Error(`Custom alias '${customAlias}' already exists.`);
      } else {
        shortUrl = generateAlias();
      }
      attempts++;
    }
  } while (isAliasFind && attempts < maxAttempts && !customAlias);

  if (attempts >= maxAttempts && !customAlias) {
    throw new Error(
      "Failed to generate unique short URL after multiple attempts."
    );
  }

  const newUrl = new Url({
    userId,
    longUrl,
    topic,
    customAlias,
    shortUrl,
  });

  const data = await newUrl.save();
  if (data) {
    await cacheService.setInCache("dataAdded", 600, JSON.stringify(data));
    return data;
  }
};

// Redirect to the original URL and log analytics
exports.redirectUrl = async (alias, req) => {
  const ipAddress = req.ip || "103.165.115.111";
  const geo = geoip.lookup(ipAddress);

  const url = await Url.findOne({ shortUrl: alias });
  if (!url) {
    throw new Error("URL not found");
  }

  const analyticsData = {
    urlId: url._id,
    ipAddress,
    userAgent: req.headers["user-agent"],
    osType: req.useragent.os || "Unknown",
    deviceType: req.useragent.isMobile ? "mobile" : "desktop",
    platform: req.useragent.platform || "Unknown",
    browser: req.useragent.browser || "Unknown",
    country: geo?.country || null,
    region: geo?.region || null,
    city: geo?.city || null,
  };

  const newAnalytics = new Analytic(analyticsData);
  await newAnalytics.save();

  url.clicks += 1;
  await url.save();

  const key = `shortUrl:${req.originalUrl}`;
  redisClient.del(key);

  const userKey = `overallAnalytics`;
  redisClient.del(userKey);

  const urlAnalyticsKey = `urlAnalytics:${alias}`;
  redisClient.del(urlAnalyticsKey);

  const topicAnalyticsKey = `topicAnalytics:${url.topic}`;
  redisClient.del(topicAnalyticsKey);

  return url.longUrl;
};
