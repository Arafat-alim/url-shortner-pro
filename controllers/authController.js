const passport = require("passport");
const { generateToken } = require("../utils/generateToken");
const User = require("../models/User");

//! Google OAuth login
exports.googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
});

//! Google OAuth callback
exports.googleCallback = (req, res, next) => {
  passport.authenticate(
    "google",
    { failureRedirect: "/auth/login" },
    (err, user, info) => {
      if (err) return next(err);
      if (!user)
        return res.status(401).json({ message: "Authentication failed" });

      //! Generate JWT token
      const token = generateToken(user.googleId);

      //! Send response with token and user details
      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.displayName,
          email: user.email,
        },
      });
    }
  )(req, res, next);
};

//! Logout
exports.googleLogout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Logout failed", error: err });
    }
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  });
};

//! find me
exports.findMe = async (req, res) => {
  try {
    const googleId = req.user.id;
    const user = await User.findOne({ googleId }).select("+deletedUser");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.deletedUser) {
      return res.status(500).json({
        success: false,
        message: "User is deleted",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error("something went wrong while fetching me: ", err.message);
    return res.status(401).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

//! delete My account

exports.deleteMyAccount = async (req, res) => {
  try {
    const googleId = req.user.id;
    const user = await User.findOne({ googleId }).select("+deletedUser");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.deletedUser) {
      return res.status(500).json({
        success: false,
        message: "User already deleted",
      });
    }
    const deletedUser = await User.findOneAndUpdate(
      { googleId, deletedUser: false },
      { deletedUser: true },
      { new: true } // Return the updated document
    );

    if (deletedUser) {
      return res.status(200).json({
        success: true,
        message: `${user.displayName} has been deleted`,
      });
    }
  } catch (err) {
    console.error(
      "something went wrong while deleting my account: ",
      err.message
    );

    return res.status(400).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

exports.login = (req, res) => {
  return res.send(`<a href="/auth/google">Google Login</a>`);
};
