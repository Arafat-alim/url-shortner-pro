const useragent = require("useragent");
const Url = require("../models/Url");
const geoip = require("geoip-lite");
const { generateAlias } = require("../utils/generateAlias");
const User = require("../models/User");

exports.createShortUrl = async (req, res) => {
  try {
    const { longUrl, customAlias } = req.body;
    const googleId = req.user.googleId;

    const user = await User.findOne({ googleId });

    if (!longUrl) {
      return res
        .status(400)
        .json({ success: false, message: "URL is required" });
    }

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
      userId: user._id,
      longUrl,
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

exports.redirectUrl = async (req, res) => {
  try {
    const { alias } = req.params;
    const ipAddress = req.headers["x-forwarded-for"] || "103.165.115.111";

    //! Analytics Records
    const agent = useragent.parse(req.headers["user-agent"]);
    const geo = geoip.lookup(ipAddress);

    //! Data
    const visitedHistoryEntry = {
      timestamps: new Date(), // Store as Date object for easier querying/sorting
      ipAddress: ipAddress,
      userAgent: req.headers["user-agent"],
      osType: agent.os.family || "Unknown", // Provide default values
      deviceType: agent.device.family || "Unknown",
      platform: agent.platform || "Unknown",
      browser: agent.family || "Unknown",
      country: geo?.country || null, // Optional chaining to handle null values safely
      region: geo?.region || null,
      city: geo?.city || null,
    };
    const entry = await Url.findOneAndUpdate(
      { userId: req.user.id, shortUrl: alias },
      {
        $push: {
          visitedHistory: visitedHistoryEntry,
        },
      },
      { new: true } // Return the updated document
    );
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Data not found, Updation failed",
      });
    }

    res.redirect(entry.longUrl);
  } catch (err) {
    console.error("Something went wrong while redirecting : ", err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to redirect URL",
    });
  }
};
