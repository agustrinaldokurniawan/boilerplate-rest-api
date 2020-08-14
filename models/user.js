const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    avatar: {
      type: String,
    },
    verified: {
      status: {
        type: Boolean,
        default: false,
      },
      token: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
