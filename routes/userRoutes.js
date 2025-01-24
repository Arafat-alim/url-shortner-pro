const express = require("express");
const userRoutes = express.Router();

//! Dashboard

userRoutes.get("/dashboard", (req, res) => {
  res.send(
    `<h1>Welcome ${
      req.user?.displayName || "User"
    }</h1> <a href="/auth/logout">Logout</a>`
  );
});

module.exports = userRoutes;
