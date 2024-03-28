const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/userController");

// GET signup page
// router.get("/sign-up", function (req, res, next) {
//   if (req.user) {
//     res.redirect("/");
//     return;
//   }
//   res.render("signup", {
//     title: "Sign Up",
//   });
// });

// GET login page
// router.get("/login", function (req, res, next) {
//   if (req.user) {
//     res.redirect("/");
//     return;
//   }

//   // console.log(req.session.messages);
//   res.render("login", { title: "Log In", messages: req.session.messages });
// });

/* GET home page. */
router.get("/", user_controller.index_get);

module.exports = router;
