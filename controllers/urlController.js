const mongoose = require("mongoose");
const Url = require("../models/Url");
const { generateAlias } = require("../utils/generateAlias");

exports.createShortUrl = async (req, res) => {
  try {
    const { longUrl, customAlias } = req.body;
    const userId = req.user.id;

    let shortUrl = customAlias || generateAlias();
    let attempts = 0; //introducing this to make sure our code will not stack in infinite loop
    const maxAttempts = 3;

    let isAliasFind;

    do {
      isAliasFind = await Url.findOne({ shortUrl });

      if (isAliasFind) {
        if (customAlias) {
          // Custom alias conflict
          if (isAliasFind.customAlias === customAlias) {
            return res.status(409).json({
              // 409 Conflict
              success: false,
              message: `Custom alias '${customAlias}' already exists. Please choose a different one.`,
            });
          }
        } else {
          shortUrl = generateAlias();
        }

        attempts++;
      }
    } while (isAliasFind && attempts < maxAttempts && !customAlias);

    if (attempts >= maxAttempts && !customAlias) {
      return res.status(500).json({
        success: false,
        message: `Failed to generate unique short URL after multiple attempts`,
      });
    }

    const newUrl = new Url({
      userId: userId,
      longUrl, // Shorthand property names
      customAlias,
      shortUrl,
    });

    await newUrl.save();
    return res.status(201).json({
      success: true,
      shortUrl,
      longUrl,
      createdAt: newUrl.createdAt,
    });
  } catch (err) {
    console.error("Error creating short URL:", err);

    if (err.code === 11000 && err.keyPattern?.shortUrl) {
      //check for mongo error code for duplicate key
      return res.status(409).json({
        //409 Conflict for duplicate shortURL (most likely in concurrency)
        success: false,
        message: "Generated short URL already exists. Please try again.", //more user friendly message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to shorten the URL",
    });
  }
};
