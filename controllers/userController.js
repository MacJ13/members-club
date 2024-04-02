const User = require("../models/user");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

const bcrypt = require("bcrypt");

const saltRounds = 10;

// display index home
exports.index_get = asyncHandler(async (req, res, next) => {
  const logged = Boolean(req.user);

  const messages = await Message.find().sort({ timeStamp: -1 }).exec();

  if (logged) {
    res.redirect(req.user.url);
  } else {
    res.render("index", {
      title: "Home page",
      logged: logged,
      messages: messages,
    });
  }
});

exports.login_get = (req, res, next) => {
  if (req.user) {
    res.redirect(req.user.url);
    return;
  }

  res.render("login", { title: "Log In", messages: req.session.messages });
};

exports.signup_get = (req, res, next) => {
  if (req.user) {
    res.redirect("/");
    return;
  }
  res.render("signup", {
    title: "Sign Up",
  });
};

exports.signup_post = [
  // validate and sanitize the name user fields
  body("fullname")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Full name must not be empty")
    .isLength({ min: 6 })
    .withMessage("Full name must contain at least 8 characters")
    .escape(),
  body("nickname")
    .trim()
    .notEmpty()
    .withMessage("Full name must not be empty")
    .isLength({ min: 3 })
    .withMessage("Nick name must contain at least 3 characters")
    .escape()
    .custom(async (value) => {
      const nicknameExists = await User.findOne({ nickname: value }).exec();
      if (nicknameExists) {
        return Promise.reject("Nickname already in use");
      }
    }),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password must not be empty")
    .isLength({ min: 5 })
    .withMessage("Password must contain at least 5 characters"),
  body("confirm")
    .trim()
    .escape()
    .custom((value, { req }) => {
      if (req.body.password !== value) {
        throw new Error();
      }

      return true;
    })
    .withMessage("password and confirm password are not equal"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const hashPassword = bcrypt.hashSync(req.body.password, saltRounds);

    const newUser = new User({
      fullname: req.body.fullname,
      nickname: req.body.nickname,
      password: hashPassword,
    });

    if (!errors.isEmpty()) {
      res.render("signup", {
        title: "Sign up",
        user: newUser,
        logged: null,
        errors: errors.array(),
      });
      return;
    } else {
      await newUser.save();
      res.redirect("/login");
    }
  }),
];

exports.login_post = [
  body("nickname")
    .trim()
    .notEmpty()
    .withMessage("Nick name must not be empty")
    .isLength({ min: 3 })
    .withMessage("Nick name must contain at least 3 characters")
    .escape(),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password must not be empty")
    .isLength({ min: 5 })
    .withMessage("Password must contain at least 5 characters"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const user = new User({
      fullname: req.body.fullname,
      nickname: req.body.nickname,
      password: req.body.password,
    });

    if (!errors.isEmpty()) {
      res.render("login", {
        title: "Log in",
        logged: null,
        user: user,
        errors: errors.array(),
      });
      return;
    } else {
      next();
    }
  }),
  passport.authenticate("local", {
    // successRedirect: "/",
    failureRedirect: "/login",
    failureMessage: true,
  }),
  (req, res, next) => {
    res.redirect(req.user.url);
  },
];

exports.logout_get = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    res.redirect("/");
  });
};

exports.user_index = asyncHandler(async (req, res, next) => {
  const logged = Boolean(req.user);

  if (!logged) {
    res.redirect("/");
  } else {
    const messages = await Message.find().sort({ timeStamp: -1 }).exec();
    res.render("index", {
      title: "Home page",
      user: req.user,
      logged: logged,
      messages: messages,
    });
  }
});
