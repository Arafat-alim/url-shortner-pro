const express = require("express");
// const authenticateJWT = require("../middlewares/authenticateJWT");
const protect = require("../middlewares/authMiddleware");
const userRoutes = express.Router();

//! Dashboard

userRoutes.get("/dashboard", protect, (req, res) => {
  res.send(
    `<h1>Welcome ${
      req.user?.displayName || "User"
    }</h1> <a href="/auth/logout">Logout</a>`
  );
});

module.exports = userRoutes;
