const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// GET signup page
router.get("/sign-up", function (req, res, next) {
  res.render("signup", { title: "Sign Up", user: undefined });
});

// GET login page

module.exports = router;
