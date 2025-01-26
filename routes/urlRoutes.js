const express = require("express");
const { createShortUrl } = require("../controllers/urlController");
const protect = require("../middlewares/authMiddleware");
const urlRouter = express.Router();

urlRouter.post("/", protect, createShortUrl);
urlRouter.get("/:alias");

module.exports = urlRouter;
