const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("../models/user");

const bcrypt = require("bcrypt");

const customFields = {
  usernameField: "nickname",
  passwordField: "password",
  passReqToCallback: true,
};

const verifyCallback = async (req, username, password, done) => {
  try {
    const user = await User.findOne({ nickname: username }).exec();

    console.log({ user });
    if (!user) {
      req.session.messages = [];
      return done(null, false, { message: "Incorrect nickname or password" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      // passwords do not match
      return done(null, false, { message: "Incorrect nickname or password" });
    } else {
      return done(null, user);
    }
  } catch (err) {
    done(err);
  }
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  console.log("serialize User");
  done(null, user.id);
});

passport.deserializeUser(async (userId, done) => {
  console.log("deserialize User");
  try {
    const user = await User.findById(userId).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});
