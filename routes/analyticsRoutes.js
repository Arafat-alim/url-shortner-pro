const express = require("express");
const {
  getUrlAnalytics,
  getOverallAnalytics,
  getTopicAnalytics,
} = require("../controllers/analyticsController");
const protect = require("../middlewares/authMiddleware");
const analyticsRouter = express.Router();

analyticsRouter.get("/overall", protect, getOverallAnalytics);
analyticsRouter.get("/topic/:topic", protect, getTopicAnalytics);
analyticsRouter.get("/alias/:alias", protect, getUrlAnalytics);

module.exports = analyticsRouter;
