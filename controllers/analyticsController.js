// const User = require("../models/User");
const redisClient = require("../config/redis");
const Url = require("../models/Url");

exports.getUrlAnalytics = async (req, res) => {
  try {
    const { alias } = req.params;
    const redisKey = `urlAnalytics:${alias}`;

    // Check Redis first
    let cachedData = await redisClient.get(redisKey);
    if (cachedData) {
      console.log("Url analytics data fetched from cache");
      return res.json(JSON.parse(cachedData));
    }

    const url = await Url.findOne({ shortUrl: alias });

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }

    const totalClicks = url.visitedHistory.length || 0;
    const uniqueUsers = new Set(
      url.visitedHistory.map((visitor) => visitor.ipAddress)
    ).size;

    //! Clicks by Date (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const clickByDate = {};

    url.visitedHistory.forEach((visitor) => {
      const date = visitor.timestamps.toISOString().split("T")[0];
      if (visitor.timestamps >= sevenDaysAgo) {
        clickByDate[date] = (clickByDate[date] || 0) + 1;
      }
    });
    const formattedClicksByDate = Object.entries(clickByDate).map(
      ([date, count]) => ({ date, count })
    );

    //! Analytics by OS Type
    const osData = {};
    url.visitedHistory.forEach((visitor) => {
      if (!osData[visitor.osType]) {
        osData[visitor.osType] = {
          uniqueClicks: 0,
          uniqueUsers: new Set(),
          deviceType: {},
        };
      }
      osData[visitor.osType].uniqueClicks++;
      osData[visitor.osType].uniqueUsers.add(visitor.ipAddress);

      if (!osData[visitor.osType].deviceType[visitor.deviceType]) {
        osData[visitor.osType].deviceType[visitor.deviceType] = {
          uniqueClicks: 0,
          uniqueUsers: new Set(),
        };
      }
      osData[visitor.osType].deviceType[visitor.deviceType].uniqueClicks++;
      osData[visitor.osType].deviceType[visitor.deviceType].uniqueUsers.add(
        visitor.ipAddress
      );
    });

    const formattedOsData = Object.entries(osData).map(([osName, data]) => {
      return {
        osName,
        uniqueClicks: data.uniqueClicks,
        uniqueUsers: data.uniqueUsers.size,
        deviceType: Object.entries(data.deviceType).map(
          ([deviceName, data]) => {
            return {
              deviceName,
              uniqueClicks: data.uniqueClicks,
              uniqueUsers: data.uniqueUsers.size,
            };
          }
        ),
      };
    });

    // Cache the result in Redis with expiry
    redisClient.setex(
      redisKey,
      600,
      JSON.stringify({
        success: true,
        totalClicks,
        uniqueUsers,
        clicksByDate: formattedClicksByDate,
        osType: formattedOsData,
      })
    );

    return res.status(200).json({
      success: true,
      totalClicks,
      uniqueUsers,
      clicksByDate: formattedClicksByDate,
      osType: formattedOsData,
    });
  } catch (err) {
    console.error("something went wrong while alias analytics: ", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetched the alias analytic data",
    });
  }
};

exports.getOverallAnalytics = async (req, res) => {
  try {
    const redisKey = `overallAnalytics`;
    let cachedData = await redisClient.get(redisKey);

    if (cachedData) {
      console.log("Overall analytics data fetched from cache");
      return res.json(JSON.parse(cachedData));
    }
    const { id } = req.user;

    const urls = await Url.find({ userId: id });
    if (!urls.length) {
      return res.status(404).json({
        success: false,
        message: "No URL Found for this URL",
      });
    }

    const totalUrls = urls.length;

    let totalClicks = 0;
    const uniqueUsers = new Set();
    const clicksByDate = {};
    const osType = {};
    const deviceType = {};

    urls.forEach((url) => {
      url.visitedHistory.forEach((visitor) => {
        //! total clicks
        totalClicks++;

        //! unique users
        uniqueUsers.add(visitor.ipAddress);

        //! clicksByDate
        const date = visitor.timestamps.toISOString().split("T")[0];
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;

        //! osType
        if (visitor.osType) {
          if (!osType[visitor.osType]) {
            osType[visitor.osType] = {
              uniqueClicks: 0,
              uniqueUsers: new Set(),
            };
            osType[visitor.osType].uniqueClicks++;
            osType[visitor.osType].uniqueUsers.add(visitor.ipAddress);
          }
        }

        //! device type
        if (visitor.deviceType) {
          if (!deviceType[visitor.deviceType]) {
            deviceType[visitor.deviceType] = {
              uniqueClicks: 0,
              uniqueUsers: new Set(),
            };

            deviceType[visitor.deviceType].uniqueClicks++;
            deviceType[visitor.deviceType].uniqueUsers.add(visitor.ipAddress);
          }
        }
      });
    });

    const formattedClicksByDate = Object.keys(clicksByDate).map((date) => ({
      date,
      clicks: clicksByDate[date],
    }));

    const formattedOsType = Object.keys(osType).map((osName) => ({
      osName,
      uniqueClicks: osType[osName].uniqueClicks,
      uniqueUsers: osType[osName].uniqueUsers.size,
    }));

    const formattedDeviceType = Object.keys(deviceType).map((deviceName) => ({
      deviceName,
      uniqueClicks: deviceType[deviceName].uniqueClicks,
      uniqueUsers: deviceType[deviceName].uniqueUsers.size,
    }));

    redisClient.setex(
      redisKey,
      600,
      JSON.stringify({
        success: true,
        totalUrls,
        totalClicks,
        uniqueUsers: uniqueUsers.size,
        clicksByDate: formattedClicksByDate,
        osType: formattedOsType,
        deviceType: formattedDeviceType,
      })
    );

    return res.status(200).json({
      success: true,
      totalUrls,
      totalClicks,
      uniqueUsers: uniqueUsers.size,
      clicksByDate: formattedClicksByDate,
      osType: formattedOsType,
      deviceType: formattedDeviceType,
    });
  } catch (err) {
    console.error(
      "Something went wrong while fetching overall analytics data",
      err.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch the overall url analytics",
    });
  }
};

exports.getTopicAnalytics = async (req, res) => {
  try {
    const { topic } = req.params;

    const redisKey = `topicAnalytic1:${topic}`;
    const cacheData = await redisClient.get(redisKey);
    if (cacheData) {
      return res.json(JSON.parse(cacheData));
    }
    //! Redis Data/topic not found then checked into the mongo database
    const urls = await Url.find({ topic });
    if (!urls.length) {
      return res.status(404).json({
        success: false,
        message: "URL not found",
      });
    }
    const totalClicks = urls.reduce(
      (acc, url) => acc + url.visitedHistory.length,
      0
    );
    const uniqueUsers = new Set(
      urls
        .map((url) => url.visitedHistory.map((visitor) => visitor.ipAddress))
        .flat()
    ).size;

    //! clicks by Date
    const clicksByDate = {};
    urls.forEach((url) => {
      url.visitedHistory.forEach((visitor) => {
        const date = visitor.timestamps.toISOString().split("T")[0];
        clicksByDate[date] = (clicksByDate[data] || 0) + 1;
      });
    });

    const formattedClicksByDate = Object.entries(clicksByDate).map(
      ([date, count]) => ({ date, count })
    );

    //! urls with analytics
    const urlsAnalytics = urls.map((url) => ({
      shortUrl: url.shortUrl,
      totalClicks: url.visitedHistory.length,
      uniqueUsers: new Set(
        url.visitedHistory.map((visitor) => visitor.ipAddress)
      ).size,
    }));

    const data = {
      totalClicks,
      uniqueUsers,
      clicksByDate: formattedClicksByDate,
      urls: urlsAnalytics,
    };

    await redisClient.setex(redisKey, 600, JSON.stringify(data));
    return res.status(200).json(data);
  } catch (err) {
    console.error(
      "Something went wrong while fetching the topic analytics: ",
      err.message
    );
  }
};
