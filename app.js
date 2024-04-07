const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const session = require("express-session");
const MongoStore = require("connect-mongo");

const passport = require("passport");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/user");

const connectDB = require("./config/database");

connectDB();

const app = express();

require("dotenv").config();
require("./config/passport");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//  SESSION SETUP
const sessionStore = new MongoStore({
  mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@myatlasclusteredu.5v0vras.mongodb.net/members_club?retryWrites=true&w=majority`,
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    // store: MongoStore.create({
    //   mongoUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@myatlasclusteredu.5v0vras.mongodb.net/members_club?retryWrites=true&w=majority`,
    // }),
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.session());

app.use((req, res, next) => {
  req.loggedUser = Boolean(req.user);
  next();
});

app.use("/", indexRouter);
app.use("/user", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
