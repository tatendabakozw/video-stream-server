const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./utils/mongo");

const PORT = process.env.PORT || 5500;

// app level middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("common"));
app.use(helmet());

// connect databse
connectDB();

// user defined routes
app.use("/api/auth", require("./routes/auth/auth"));
app.use('/api/video', require('./routes/video/video'))

//not found handler
app.use((req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

//error handling middleware
app.use((error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  console.log(error);
  res.send({
    message: error.message,
    stack:
      process.env.NODE_ENV === "production"
        ? "only viewable in development"
        : error.stack,
  });
});

// home
app.get("/", (req, res) => {
  res.send({
    message: "Api for NSFW app",
  });
});

// listener
app.listen(PORT, (err) => {
  if (err) {
    console.error(`${err}`);
  }
  console.log(`Server up on port ${PORT}`);
});
