const User = require("../models/user");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const passport = require("passport");

const bcrypt = require("bcrypt");

const saltRounds = 10;

require("dotenv").config();

// display index home
exports.index_get = asyncHandler(async (req, res, next) => {
  if (req.user) {
    res.redirect(req.user.url);
  } else {
    const messages = await Message.find()
      .sort({ timeStamp: -1 })
      .populate("user", "nickname")
      .exec();

    res.render("index", {
      title: "Home page",
      logged: req.loggedUser,
      messages: messages,
    });
  }
});

exports.user_index = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.redirect("/");
  } else {
    const messages = await Message.find()
      .sort({ timeStamp: -1 })
      .populate("user", "nickname")
      .exec();

    res.render("index", {
      title: "Home page",
      user: req.user,
      logged: req.loggedUser,
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
    res.redirect(req.user);
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
  body("admin")
    .trim()
    .escape()
    .custom((value) => {
      if (value === "") {
        return true;
      }

      if (process.env.ADMIN_SECRET !== value) {
        throw new Error();
      }

      return true;
    })
    .withMessage("Value does not match secret key"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const hashPassword = bcrypt.hashSync(req.body.password, saltRounds);

    const admin = Boolean(req.body.admin === process.env.ADMIN_SECRET);

    const newUser = new User({
      fullname: req.body.fullname,
      nickname: req.body.nickname,
      password: hashPassword,
      admin: admin,
      membership_status: admin,
    });

    if (!errors.isEmpty()) {
      res.render("signup", {
        title: "Sign up",
        user: newUser,
        logged: req.loggedUser,
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

    req.session.messages = [];

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

exports.user_memberclub_get = (req, res, next) => {
  if (!req.user) {
    res.redirect("/");
    return;
  }

  const member = req.user.membership_status;
  if (member) {
    res.redirect(req.user.url);
    return;
  }

  res.render("join", {
    title: "Join the club",
    user: req.user,
    logged: req.loggedUser,
  });
};

exports.user_memberclub_post = [
  body("secret")
    .trim()
    .notEmpty()
    .withMessage("Secret key must not be empty")
    .isLength({ min: 5 })
    .withMessage("Secret key must contain at least 5 characters")
    .escape()
    .custom((value) => {
      if (process.env.CLUB_SECRET !== value) {
        throw new Error();
      }
      return true;
    })
    .withMessage("Value does not match secret key")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("join", {
        title: "Join the club",
        user: req.user,
        logged: req.loggedUser,
        errors: errors.array(),
      });
    } else {
      const user = await User.findOne({ nickname: req.body.nickname }).exec();

      user.membership_status = true;

      await user.save();

      res.redirect(user.url);
    }
  }),
];

exports.user_profile_get = asyncHandler(async (req, res, next) => {
  res.render("profile", {
    title: "User Profile",
    user: req.user,
    logged: req.loggedUser,
  });
});

exports.user_update_names = [
  body("fullname")
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage("Full name must not be empty")
    .isLength({ min: 6 })
    .withMessage("Full name must contain at least 6 characters")
    .escape(),
  body("nickname")
    .trim()
    .notEmpty()
    .withMessage("Nick name must not be empty")
    .isLength({ min: 3 })
    .withMessage("Nick name must contain at least 3 characters")
    .escape()
    .custom(async (value) => {
      const nicknameExists = await User.findOne({ nickname: value }).exec();

      if (nicknameExists.nickname.toLowerCase() === value.toLowerCase())
        return true;

      if (nicknameExists) {
        return Promise.reject(`Nickname - ${value} - already in use`);
      }
    }),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("profile", {
        title: "User Profile",
        errors: errors.array(),
        user: req.user,
        logged: req.loggedUser,
      });
      return;
    } else {
      const user = await User.findById(req.params.id).exec();

      user.fullname = req.body.fullname;
      user.nickname = req.body.nickname;

      await user.save();

      res.redirect(req.user.url + "/profile");
    }
  }),
];

exports.user_update_password = [
  body("password")
    .trim()
    .notEmpty()
    .withMessage("password must not be empty")
    .isLength({ min: 5 })
    .withMessage("Password must contain at least 5 characters")
    .custom(async (value, { req }) => {
      const match = await bcrypt.compare(value, req.user.password);

      if (match) {
        throw new Error();
      }

      return true;
    })
    .withMessage("password is the same as previous")
    .escape(),
  body("confirm")
    .trim()
    .escape()
    .custom((value, { req }) => {
      if (req.body.password !== value) {
        throw new Error();
      }

      return true;
    })
    .withMessage("password and confirm are not equal"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("profile", {
        title: "User Profile",
        errors: errors.array(),
        user: req.user,
        logged: req.loggedUser,
      });
      return;
    } else {
      const hashPassword = bcrypt.hashSync(req.body.password, saltRounds);

      const user = await User.findById(req.params.id).exec();

      user.password = hashPassword;

      await user.save();

      res.redirect(req.user.url + "/profile");
    }
  }),
];

exports.user_add_admin = [
  body("admin")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Admin secret code must not be empty")
    .custom((value) => {
      if (process.env.ADMIN_SECRET !== value) {
        throw new Error();
      }
      return true;
    })
    .withMessage("Value does not match secret key")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("profile", {
        title: "User Profile",
        errors: errors.array(),
        user: req.user,
        logged: req.loggedUser,
      });
      return;
    } else {
      const admin = Boolean(req.body.admin);

      const user = await User.findById(req.params.id).exec();

      user.admin = admin;
      if (!user.membership_status) user.membership_status = admin;

      await user.save();

      res.redirect(req.user.url + "/profile");
    }
  }),
];

exports.user_delete_get = asyncHandler(async (req, res, next) => {
  const backURL = req.header("Referer") || "/";
  const url = new URL(backURL);

  res.render("user_delete", {
    title: "Delete User",
    user: req.user,
    logged: req.loggedUser,
    previousPathname: url.pathname,
  });
});

exports.user_delete_post = asyncHandler(async (req, res, next) => {
  req.logout(async (err) => {
    if (err) return next(err);

    await Promise.all([
      User.deleteOne({ _id: req.params.id }),
      Message.deleteMany({ user: req.params.id }),
    ]);

    res.redirect("/");
  });
});
