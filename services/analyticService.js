const Url = require("../models/Url");
const Analytic = require("../models/Analytic");
const redisClient = require("../config/redis");
const cacheService = require("../services/cacheService");
const mongoose = require("mongoose");

// Get URL analytics
exports.getUrlAnalyticsService = async (alias) => {
  const redisKey = `urlAnalytics:${alias}`;
  const cachedData = await cacheService.getFromCache(redisKey);

  if (cachedData) {
    return cachedData;
  }

  const url = await Url.findOne({ shortUrl: alias });
  if (!url) {
    throw new Error("URL not found");
  }

  const analytics = await Analytic.aggregate([
    { $match: { urlId: url._id } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        clicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    { $sort: { "_id.date": -1 } },
    { $limit: 7 },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        clicks: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
  ]);

  const osAnalytics = await Analytic.aggregate([
    { $match: { urlId: url._id } },
    {
      $group: {
        _id: "$osType",
        uniqueClicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        _id: 0,
        osName: "$_id",
        uniqueClicks: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
  ]);

  const deviceAnalytics = await Analytic.aggregate([
    { $match: { urlId: url._id } },
    {
      $group: {
        _id: "$deviceType",
        uniqueClicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        _id: 0,
        deviceName: "$_id",
        uniqueClicks: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
  ]);

  const totalClicks = await Analytic.countDocuments({ urlId: url._id });

  const uniqueUsers = await Analytic.distinct("ipAddress", { urlId: url._id });

  const response = {
    totalClicks,
    uniqueUsers: uniqueUsers.length,
    clicksByDate: analytics,
    osType: osAnalytics,
    deviceType: deviceAnalytics,
  };

  await cacheService.setInCache(redisKey, response);
  return response;
};

// Get overall analytics
exports.getOverallAnalyticsService = async (userId) => {
  const redisKey = `overallAnalytics:${userId}`;
  const cachedData = await cacheService.getFromCache(redisKey);
  if (cachedData) {
    return cachedData;
  }

  const analytics = await Analytic.aggregate([
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
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        totalClicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    { $sort: { "_id.date": -1 } },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        clicks: "$totalClicks",
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
  ]);

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
        uniqueClicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        _id: 0,
        osName: "$_id",
        uniqueClicks: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
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
        uniqueClicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    {
      $project: {
        _id: 0,
        deviceName: "$_id",
        uniqueClicks: 1,
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
  ]);

  const totalUrls = await Url.countDocuments({ userId });
  const totalClicks = await Analytic.countDocuments({
    urlId: { $in: await Url.find({ userId }).distinct("_id") },
  });
  const uniqueUsers = await Analytic.distinct("ipAddress", {
    urlId: { $in: await Url.find({ userId }).distinct("_id") },
  });

  const response = {
    totalUrls,
    totalClicks,
    uniqueUsers: uniqueUsers.length,
    clicksByDate: analytics,
    osType: osAnalytics,
    deviceType: deviceAnalytics,
  };

  await cacheService.setInCache(redisKey, response);
  return response;
};

// Get topic-based analytics
exports.getTopicAnalytics = async (topic) => {
  const redisKey = `topicAnalytics:${topic}`;
  const cachedData = await redisClient.get(redisKey);
  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const analytics = await Analytic.aggregate([
    {
      $lookup: {
        from: "urls",
        localField: "urlId",
        foreignField: "_id",
        as: "url",
      },
    },
    { $unwind: "$url" },
    { $match: { "url.topic": topic } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
        totalClicks: { $sum: 1 },
        uniqueUsers: { $addToSet: "$ipAddress" },
      },
    },
    { $sort: { "_id.date": -1 } },
    {
      $project: {
        _id: 0,
        date: "$_id.date",
        clicks: "$totalClicks",
        uniqueUsers: { $size: "$uniqueUsers" },
      },
    },
  ]);

  const totalClicks = await Analytic.countDocuments({
    urlId: { $in: await Url.find({ topic }).distinct("_id") },
  });
  const uniqueUsers = await Analytic.distinct("ipAddress", {
    urlId: { $in: await Url.find({ topic }).distinct("_id") },
  });

  const urls = await Url.aggregate([
    { $match: { topic } },
    {
      $lookup: {
        from: "analytics",
        localField: "_id",
        foreignField: "urlId",
        as: "analyticsData",
      },
    },
    {
      $project: {
        shortUrl: 1,
        totalClicks: { $size: "$analyticsData" },
        uniqueUsers: {
          $size: {
            $setUnion: "$analyticsData.ipAddress",
          },
        },
      },
    },
  ]);

  const response = {
    totalClicks,
    uniqueUsers: uniqueUsers.length,
    clicksByDate: analytics,
    urls,
  };

  await redisClient.setex(redisKey, 600, JSON.stringify(response));
  return response;
};
