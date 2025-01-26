const Jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return Jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

module.exports = { generateToken };
