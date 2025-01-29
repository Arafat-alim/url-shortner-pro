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
    const redisKey = `overallAnalytics:${req.user.id}`;
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
        message: "No URLs found for this user",
      });
    }

    const totalUrls = urls.length;
    let totalClicks = 0;
    const uniqueUsers = new Set();
    const clicksByDate = {};
    const osStats = {};
    const deviceStats = {};

    urls.forEach((url) => {
      url.visitedHistory.forEach((visitor) => {
        //! Count total clicks
        totalClicks++;

        //! Track unique users
        uniqueUsers.add(visitor.ipAddress);

        //! Track clicks by date
        const date = visitor.timestamps.toISOString().split("T")[0];
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;

        //! Track OS statistics
        if (visitor.osType) {
          if (!osStats[visitor.osType]) {
            osStats[visitor.osType] = {
              uniqueClicks: 0,
              uniqueUsers: new Set(),
            };
          }
          osStats[visitor.osType].uniqueClicks++;
          osStats[visitor.osType].uniqueUsers.add(visitor.ipAddress);
        }

        //! Track device statistics
        if (visitor.deviceType) {
          if (!deviceStats[visitor.deviceType]) {
            deviceStats[visitor.deviceType] = {
              uniqueClicks: 0,
              uniqueUsers: new Set(),
            };
          }
          deviceStats[visitor.deviceType].uniqueClicks++;
          deviceStats[visitor.deviceType].uniqueUsers.add(visitor.ipAddress);
        }
      });
    });

    // Format the response data
    const formattedClicksByDate = Object.keys(clicksByDate).map((date) => ({
      date,
      clicks: clicksByDate[date],
    }));

    const formattedOsType = Object.keys(osStats).map((osName) => ({
      osName,
      uniqueClicks: osStats[osName].uniqueClicks,
      uniqueUsers: osStats[osName].uniqueUsers.size,
    }));

    const formattedDeviceType = Object.keys(deviceStats).map((deviceName) => ({
      deviceName,
      uniqueClicks: deviceStats[deviceName].uniqueClicks,
      uniqueUsers: deviceStats[deviceName].uniqueUsers.size,
    }));

    // Prepare final response object
    const responseData = {
      success: true,
      totalUrls,
      totalClicks,
      uniqueUsers: uniqueUsers.size,
      clicksByDate: formattedClicksByDate,
      osType: formattedOsType,
      deviceType: formattedDeviceType,
    };

    // Cache the response in Redis for 10 minutes
    redisClient.setex(redisKey, 600, JSON.stringify(responseData));

    return res.status(200).json(responseData);
  } catch (err) {
    console.error("Error fetching overall analytics:", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch overall analytics",
    });
  }
};

exports.getTopicAnalytics = async (req, res) => {
  try {
    const { topic } = req.params;

    const redisKey = `topicAnalytics:${topic}`;
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
        clicksByDate[date] = (clicksByDate[date] || 0) + 1;
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

    const finalData = {
      totalClicks,
      uniqueUsers,
      clicksByDate: formattedClicksByDate,
      urls: urlsAnalytics,
    };

    await redisClient.setex(redisKey, 600, JSON.stringify(finalData));
    return res.status(200).json(finalData);
  } catch (err) {
    console.error(
      "Something went wrong while fetching the topic analytics: ",
      err.message
    );
  }
};
