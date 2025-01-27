const express = require("express");
const { createShortUrl, redirectUrl } = require("../controllers/urlController");
const protect = require("../middlewares/authMiddleware");
const urlRouter = express.Router();

urlRouter.post("/", protect, createShortUrl);
// urlRouter.get("/:alias", protect, redirectUrl);
urlRouter.get("/:alias", protect, redirectUrl);

module.exports = urlRouter;
