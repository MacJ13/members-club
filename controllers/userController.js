const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

const bcrypt = require("bcrypt");

const saltRounds = 10;

// display index home
exports.index_get = (req, res, next) => {
  //   console.log("user in index ", req.user);

  const logged = Boolean(req.user);

  res.render("index", { title: "Home page", user: req.user, logged: logged });
};

exports.login_get = (req, res, next) => {
  if (req.user) {
    res.redirect("/");
    return;
  }

  res.render("login", { title: "Log In", messages: req.session.messages });
};
