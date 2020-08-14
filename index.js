const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const socketio = require("./socketio");
require("dotenv").config();

const app = express();

mongoose.connect(
  process.env.MONGODB_ATLAS,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) return console.log(`Error while connecting to mongodb: ${err}`);

    return console.log("Connected to mongodb");
  }
);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const authRoute = require("./routes/auth");

app.use("/api", authRoute);

const server = app.listen(process.env.PORT || 8080, (err) => {
  if (err) return console.log(`Error while starting server : ${err}`);

  return console.log(`Server is running on port ${server.address().port}`);
});

socketio.init(server);
