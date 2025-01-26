const Jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      //   token = req.headers.authorization[0].split(" ")[1];
      token = req.headers.authorization.split(" ")[1];
      const verifiedJwtToken = await Jwt.verify(token, process.env.JWT_SECRET);
      if (verifiedJwtToken) {
        req.user = verifiedJwtToken;
        next();
      } else {
        return res
          .status(401)
          .json({ status: false, message: "Unauthorized! Token expired" });
      }
    } catch (err) {
      console.log("Something went wrong with protect middleware: ", err);
      return res.status(401).json({
        status: false,
        message: "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ status: false, message: "Not Authorized. no token" });
  }
};

module.exports = protect;
