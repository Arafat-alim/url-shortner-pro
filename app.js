//! load environment variables
require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");

//! Middlewares
app.use(cors());
app.use(express.json());

//! Test Routes
app.get("/", (req, res) => {
  res.status(200).send({
    status: "success",
    message: "url shortner server is running",
  });
});

//! start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
