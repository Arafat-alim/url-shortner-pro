const express = require("express");
const { getUrlAnalytics } = require("../controllers/analyticsController");
const protect = require("../middlewares/authMiddleware");
const analyticsRouter = express.Router();

analyticsRouter.get("/:alias", protect, getUrlAnalytics);

module.exports = analyticsRouter;
