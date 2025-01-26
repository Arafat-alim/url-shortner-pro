const express = require("express");
const {
  googleLogin,
  googleCallback,
  googleLogout,
  findMe,
  deleteMyAccount,
} = require("../controllers/authController");
const protect = require("../middlewares/authMiddleware");
const authRouter = express.Router();

//! google login
authRouter.get("/google", googleLogin);

//! google callback
authRouter.get("/google/callback", googleCallback);

//! google logout
authRouter.get("/logout", googleLogout);

//! find me
authRouter.get("/me", protect, findMe);

//! delete my account
authRouter.delete("/delete-account", protect, deleteMyAccount);

module.exports = authRouter;
