const path = require("path");

const { v4: uuidv4 } = require("uuid");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const app = express();

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media");
  },
  filename: (req, file, cb) => {
    cb(null, "/MX" + uuidv4() + "=" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

require("dotenv").config();

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: multerStorage, fileFilter: fileFilter }).single("image")
);
app.use("/media", express.static(path.join(__dirname, "media")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    // console.log(result);
    const server = app.listen(8080);
    const io = require('socket.io')(server);
    io.on('connection', socket => {
      console.log('Client connected')
    });
  })
  .catch((err) => console.log(err));
