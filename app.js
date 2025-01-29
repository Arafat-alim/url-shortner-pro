//! load environment variables
require("dotenv").config();
const passport = require("passport");
require("./config/passport.js");
const { default: helmet } = require("helmet");
const session = require("express-session");
const useragent = require("express-useragent");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userRoutes.js");
const urlRoutes = require("./routes/urlRoutes.js");
const analyticsRoutes = require("./routes/analyticsRoutes.js");
const {
  swaggerUi,
  swaggerSpec,
  swaggerUiOptions,
} = require("./config/swagger");

const express = require("express");
const app = express();
const cors = require("cors");

//! mongodb connection
const connectDB = require("./config/db.js");
const limiter = require("./middlewares/rateLimit.js");
connectDB();

//! Middlewares
const corsOptions = {
  origin: "*", // Change this to specific domains in production
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
};
app.use(cors(corsOptions));
app.use(helmet());
// app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//! Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use("/api/", limiter);

//! user agent expose
app.use(useragent.express());

//! authentication
app.use(passport.initialize());
app.use(passport.session());

//! routes
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerUiOptions)
);
app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/v1/shorten", urlRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

//! Test Routes
app.get("/", (req, res) => {
  res.status(200).send({
    status: "success",
    message: "url shortner server is running",
  });
});

//! start server
const PORT = process.env.PORT || 5000;
console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
