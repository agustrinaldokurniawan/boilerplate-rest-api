const express = require("express");
const route = express.Router();

const {
  login,
  signup,
  verifiedAccount,
  getNewVerificationToken,
} = require("../controllers/auth");

route
  .post("/login", login)
  .post("/signup", signup)
  .post("/verified-account/:token", verifiedAccount)
  .post("/get-new-verfication-token", getNewVerificationToken);

module.exports = route;
