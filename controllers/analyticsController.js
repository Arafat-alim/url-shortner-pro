// const User = require("../models/User");
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

    const response = await analyticService.getOverallAnalyticsService(userId);

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

    const response = await analyticService.getTopicAnalyticsService(topic);

    // Step 7: Send the response
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching topic analytics:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch topic analytics" });
  }
};
