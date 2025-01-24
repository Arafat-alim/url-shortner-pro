const express = require("express");
const passport = require("passport");
const router = express.Router();

//! Google Login

router.get("/login", (req, res) => {
  res.send("<a href='/auth/google'/>Google Login</a>");
});

//!  Google OAuth login route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//! // Google OAuth callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/api/user/dashboard");
  }
);

//! Logout route
router.get("/logout", (req, res) => {
  req.logOut((err) => {
    if (err) return res.status(500).send("Logout failed");
    res.redirect("/auth/login");
  });
});

module.exports = router;
