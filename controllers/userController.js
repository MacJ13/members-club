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
    // bcrypt.hash(
    //   req.body.password,
    //   saltRounds,
    //   async function (err, hashPassword) {
    //     if (err) {
    //       next(err);
    //     }

    //     const newUser = new User({
    //       fullname: req.body.fullname,
    //       nickname: req.body.nickname,
    //       password: hashPassword,
    //     });

    //     if (!errors.isEmpty()) {
    //       res.render("signup", {
    //         title: "Sign up",
    //         user: newUser,
    //         errors: errors.array(),
    //       });
    //       return;
    //     } else {
    //       await newUser.save();
    //       res.redirect("/login");
    //     }
    //   }
    // );
  }),
];
