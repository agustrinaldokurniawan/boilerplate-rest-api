const User = require("../models/user");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const fs = require("fs");

const payload = {};

const privateKey = fs.readFileSync("private.key", "utf-8");
const publicKey = fs.readFileSync("public.key", "utf-8");

const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username }).exec((err, user) => {
    if (err) return res.status(400).json({ message: err });

    if (user == null) {
      return res.status(403).json({ message: "Account not found" });
    }

    if (!user.verified.status) {
      return res.status(403).json({ message: "Account not verified" });
    }

    bcrypt.compare(password, user.password).then((result) => {
      if (!result) {
        return res.status(403).json({ message: "Password False" });
      }

      const signOptions = {
        issuer: process.env.API_NAME,
        subject: user.username,
        audience: process.env.API_URI,
        expiresIn: "12h",
        algorithm: "RS256",
      };
      const token = jwt.sign(payload, privateKey, signOptions);

      return res.json({ user, token });
    });
  });
};

exports.signup = (req, res) => {
  const { username, password, name } = req.body;

  User.findOne({ username }).exec((err, user) => {
    if (err) return res.status(400).json({ message: err });

    if (user !== null) {
      return res.status(403).json({ message: "Username already used" });
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
      const signOptions = {
        issuer: process.env.API_NAME,
        subject: username,
        audience: process.env.API_URI,
        expiresIn: "12h",
        algorithm: "RS256",
      };
      const token = jwt.sign(payload, privateKey, signOptions);

      const newUser = new User({
        username,
        password: hash,
        name,
        verified: {
          token,
        },
      });

      newUser.save((err, user) => {
        if (err) return res.status(400).json({ message: err });

        return res.json({ user, token });
      });
    });
  });
};

exports.verifiedAccount = (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username }).exec((err, user) => {
    if (err) return res.status(400).json({ message: err });

    if (user == null) {
      return res.status(403).json({ message: "Account not found" });
    }

    bcrypt.compare(password, user.password).then((result) => {
      if (!result) {
        return res.status(403).json({ message: "Password False" });
      }

      const verifyOptions = {
        issuer: process.env.API_NAME,
        subject: username,
        audience: process.env.API_URI,
        expiresIn: "12h",
        algorithm: ["RS256"],
      };

      jwt.verify(
        user.verified.token,
        publicKey,
        verifyOptions,
        (err, decoded) => {
          if (err) return res.status(400).json({ message: err });

          user.verified.status = true;
          (user.verified.token = null),
            user.save((err, docs) => {
              if (err) res.status(400).json({ message: err });

              return res.json({ user: docs, decoded });
            });
        }
      );
    });
  });
};

exports.getNewVerificationToken = (req, res) => {
  const { username, password } = req.body;

  User.findOne({ username }).exec((err, user) => {
    if (err) return res.status(400).json({ message: err });

    if (user == null) {
      return res.status(403).json({ message: "Account not found" });
    }

    bcrypt.compare(password, user.password).then((result) => {
      if (!result) {
        return res.status(403).json({ message: "Password False" });
      }

      const verifyOptions = {
        issuer: process.env.API_NAME,
        subject: username,
        audience: process.env.API_URI,
        algorithm: ["RS256"],
      };

      jwt.verify(
        user.verified.token,
        publicKey,
        verifyOptions,
        (err, decoded) => {
          if (err) {
            const signOptions = {
              issuer: process.env.API_NAME,
              subject: username,
              audience: process.env.API_URI,
              expiresIn: "12h",
              algorithm: "RS256",
            };
            const token = jwt.sign(payload, privateKey, signOptions);

            user.verified.token = token;

            user.save((err, docs) => {
              if (err) return res.status(400).json({ message: err });

              return res.json({ message: "Token updated", user: docs });
            });
          } else {
            return res.json({ user, decoded, message: "Token still active" });
          }
        }
      );
    });
  });
};
