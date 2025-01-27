const Jwt = require("jsonwebtoken");

const generateJwtToken = (user) => {
  const userDetails = {
    id: user._id,
    googleId: user.googleId,
    email: user.email,
    displayName: user.displayName,
  };

  return Jwt.sign(userDetails, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

module.exports = { generateJwtToken };
