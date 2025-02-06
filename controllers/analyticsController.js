// const User = require("../models/User");
const redisClient = require("../config/redis");
const Url = require("../models/Url");
const Analytic = require("../models/Analytic");
const mongoose = require("mongoose");
const analyticService = require("../services/analyticService");

exports.getUrlAnalytics = async (req, res) => {
  const { alias } = req.params;
  try {
    // Check Redis cache first
    const response = await analyticService.getUrlAnalyticsService(alias);

    // Step 6: Send the response
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching URL analytics:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch URL analytics" });
  }
};

exports.getOverallAnalytics = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user's ID

    // Step 1: Check if the analytics data is cached in Redis
    const redisKey = `overallAnalytics:${userId}`;
    const cachedData = await redisClient.get(redisKey);

    if (cachedData) {
      console.log("Overall analytics data fetched from cache");
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Step 2: Use MongoDB aggregation to calculate overall analytics
    const analytics = await Analytic.aggregate([
      // Match analytics data for URLs created by the authenticated user
      {
        $lookup: {
          from: "urls", // Join with the Url collection
          localField: "urlId", // Field from the Analytic collection
          foreignField: "_id", // Field from the Url collection
          as: "url",
        },
      },
      { $unwind: "$url" }, // Unwind the joined URL data
      { $match: { "url.userId": new mongoose.Types.ObjectId(userId) } }, // Filter by user ID

      // Group by date to calculate clicksByDate
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          totalClicks: { $sum: 1 }, // Total clicks per day
          uniqueUsers: { $addToSet: "$ipAddress" }, // Unique users per day
        },
      },

      // Sort by date (most recent first)
      { $sort: { "_id.date": -1 } },

      // Format the clicksByDate array
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          clicks: "$totalClicks",
          uniqueUsers: { $size: "$uniqueUsers" }, // Count unique users
        },
      },
    ]);

    // Step 3: Calculate OS and Device Type analytics
    const osAnalytics = await Analytic.aggregate([
      {
        $lookup: {
          from: "urls",
          localField: "urlId",
          foreignField: "_id",
          as: "url",
        },
      },
      { $unwind: "$url" },
      { $match: { "url.userId": new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$osType",
          uniqueClicks: { $sum: 1 }, // Total clicks per OS
          uniqueUsers: { $addToSet: "$ipAddress" }, // Unique users per OS
        },
      },
      {
        $project: {
          _id: 0,
          osName: "$_id",
          uniqueClicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" }, // Count unique users
        },
      },
    ]);

    const deviceAnalytics = await Analytic.aggregate([
      {
        $lookup: {
          from: "urls",
          localField: "urlId",
          foreignField: "_id",
          as: "url",
        },
      },
      { $unwind: "$url" },
      { $match: { "url.userId": new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$deviceType",
          uniqueClicks: { $sum: 1 }, // Total clicks per device type
          uniqueUsers: { $addToSet: "$ipAddress" }, // Unique users per device type
        },
      },
      {
        $project: {
          _id: 0,
          deviceName: "$_id",
          uniqueClicks: 1,
          uniqueUsers: { $size: "$uniqueUsers" }, // Count unique users
        },
      },
    ]);

    // Step 4: Calculate total URLs, total clicks, and unique users
    const totalUrls = await Url.countDocuments({ userId });
    const totalClicks = await Analytic.countDocuments({
      urlId: { $in: await Url.find({ userId }).distinct("_id") },
    });
    const uniqueUsers = await Analytic.distinct("ipAddress", {
      urlId: { $in: await Url.find({ userId }).distinct("_id") },
    });

    // Step 5: Format the response
    const response = {
      totalUrls,
      totalClicks,
      uniqueUsers: uniqueUsers.length,
      clicksByDate: analytics,
      osType: osAnalytics,
      deviceType: deviceAnalytics,
    };

    // Step 6: Cache the response in Redis for 10 minutes
    await redisClient.setex(redisKey, 600, JSON.stringify(response));

    // Step 7: Send the response
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching overall analytics:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch overall analytics" });
  }
};

exports.getTopicAnalytics = async (req, res) => {
  try {
    const { topic } = req.params;

    // Step 1: Check if the analytics data is cached in Redis
    const redisKey = `topicAnalytics:${topic}`;
    const cachedData = await redisClient.get(redisKey);

    if (cachedData) {
      console.log("Topic analytics data fetched from cache");
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Step 2: Use MongoDB aggregation to calculate topic-based analytics
    const analytics = await Analytic.aggregate([
      // Match analytics data for URLs belonging to the specified topic
      {
        $lookup: {
          from: "urls", // Join with the Url collection
          localField: "urlId", // Field from the Analytic collection
          foreignField: "_id", // Field from the Url collection
          as: "url",
        },
      },
      { $unwind: "$url" }, // Unwind the joined URL data
      { $match: { "url.topic": topic } }, // Filter by topic

      // Group by date to calculate clicksByDate
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          totalClicks: { $sum: 1 }, // Total clicks per day
          uniqueUsers: { $addToSet: "$ipAddress" }, // Unique users per day
        },
      },

      // Sort by date (most recent first)
      { $sort: { "_id.date": -1 } },

      // Format the clicksByDate array
      {
        $project: {
          _id: 0,
          date: "$_id.date",
          clicks: "$totalClicks",
          uniqueUsers: { $size: "$uniqueUsers" }, // Count unique users
        },
      },
    ]);

    // Step 3: Calculate total clicks and unique users for the topic
    const totalClicks = await Analytic.countDocuments({
      urlId: { $in: await Url.find({ topic }).distinct("_id") },
    });
    const uniqueUsers = await Analytic.distinct("ipAddress", {
      urlId: { $in: await Url.find({ topic }).distinct("_id") },
    });

    // Step 4: Get URLs under the specified topic with their analytics
    const urls = await Url.aggregate([
      { $match: { topic } }, // Filter URLs by topic
      {
        $lookup: {
          from: "analytics", // Join with the Analytic collection
          localField: "_id", // Field from the Url collection
          foreignField: "urlId", // Field from the Analytic collection
          as: "analyticsData",
        },
      },
      {
        $project: {
          shortUrl: 1,
          totalClicks: { $size: "$analyticsData" }, // Total clicks for the URL
          uniqueUsers: {
            $size: {
              $setUnion: "$analyticsData.ipAddress", // Unique users for the URL
            },
          },
        },
      },
    ]);

    // Step 5: Format the response
    const response = {
      totalClicks,
      uniqueUsers: uniqueUsers.length,
      clicksByDate: analytics,
      urls,
    };

    // Step 6: Cache the response in Redis for 10 minutes
    await redisClient.setex(redisKey, 600, JSON.stringify(response));

    // Step 7: Send the response
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching topic analytics:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch topic analytics" });
  }
};
