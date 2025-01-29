const express = require("express");
const { createShortUrl, redirectUrl } = require("../controllers/urlController");
const protect = require("../middlewares/authMiddleware");
const urlRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: URL
 *   description: URL Shortener Operations
 */

/**
 * @swagger
 * /api/v1/shorten:
 *   post:
 *     summary: Create a short URL
 *     tags: [URL]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShortUrl'
 *     responses:
 *       201:
 *         description: Short URL created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShortUrl'
 *       400:
 *         description: Invalid request
 *       409:
 *         description: Conflict (custom alias already exists)
 *       500:
 *         description: Server error
 */
urlRouter.post("/", protect, createShortUrl);

/**
 * @swagger
 * /api/v1/shorten/{alias}:
 *   get:
 *     summary: Redirect to the original URL
 *     tags: [URL]
 *     parameters:
 *       - in: path
 *         name: alias
 *         schema:
 *           type: string
 *         required: true
 *         description: Alias of the short URL
 *     responses:
 *       302:
 *         description: Redirects to the original URL
 *       404:
 *         description: Not found
 */
urlRouter.get("/:alias", redirectUrl);

module.exports = urlRouter;
