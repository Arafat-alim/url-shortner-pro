// const User = require("../models/User");
const Url = require("../models/Url");

exports.getUrlAnalytics = async (req, res) => {
  try {
    const { alias, page, limit } = req.params;
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

    return res.status(200).json({
      success: true,
      message: "Ran successfully",
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
