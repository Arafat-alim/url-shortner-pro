const express = require("express");
const {
  getUrlAnalytics,
  getOverallAnalytics,
} = require("../controllers/analyticsController");
const protect = require("../middlewares/authMiddleware");
const analyticsRouter = express.Router();

analyticsRouter.get("/overall", protect, getOverallAnalytics);
analyticsRouter.get("/:alias", protect, getUrlAnalytics);

module.exports = analyticsRouter;
