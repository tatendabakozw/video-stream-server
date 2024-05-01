const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./utils/mongo");

const PORT = process.env.PORT || 5500;

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

// a server for socket io
var server = require("http").createServer(app);
const socketio = require("socket.io");
const WebSockets = require("./helpers/WebSockets");
global.io = socketio(server);
global.io.on("connection", WebSockets.connection);

// app level middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("common"));
app.use(helmet());

// connect databse
connectDB();

// home
app.get("/", (req, res) => {
  res.send({
    message: "Api for NSFW app",
  });
});

// user defined routes
app.use("/api/auth", require("./routes/auth/auth"));
app.use("/api/video", require("./routes/video/video"));
app.use("/api/comment", require("./routes/comment/comment"));
app.use("/api/like", require("./routes/like/like"));
app.use("/api/subscribe", require("./routes/subscriber/subscriber"));
app.use("/api/chat", require("./routes/chat/chat"));
app.use("/api/report", require("./routes/report/report"));
app.use("/api/user", require("./routes/user/user"));
app.use("/api/channel", require("./routes/channel/channel"));
app.use("/api/admin", require("./routes/admin/admin"));
app.use("/api/admin", require("./routes/admin/login"));

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

// listener
server.listen(PORT, (err) => {
  if (err) {
    console.error(`${err}`);
  }
  console.log(`Server up on port ${PORT}`);
});
