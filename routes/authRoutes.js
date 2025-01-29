const express = require("express");
const {
  googleLogin,
  googleCallback,
  googleLogout,
  findMe,
  deleteMyAccount,
} = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");
const passport = require("passport");
const authRouter = express.Router();

// //! google login
// authRouter.get("/google", googleLogin);

// //! google callback
// authRouter.get("/google/callback", googleCallback);

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Authenticate with Google OAuth
 *     description: Redirects the user to Google's OAuth 2.0 authentication.
 *     security: []
 *     responses:
 *       302:
 *         description: Redirects to Google OAuth login page.
 */
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth Callback
 *     description: Handles authentication callback from Google.
 *     security: []
 *     responses:
 *       200:
 *         description: Successfully authenticated.
 *       401:
 *         description: Unauthorized.
 */
authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/api-docs");
  }
);

//! google logout
authRouter.get("/logout", googleLogout);

//! find me
authRouter.get("/me", protect, findMe);

//! delete my account
authRouter.delete("/delete-account", protect, deleteMyAccount);

module.exports = authRouter;
