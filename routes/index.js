const express = require("express");
const router = express.Router();

const user_controller = require("../controllers/userController");

/* GET home page. */
router.get("/", user_controller.index_get);

// GET login page
router.get("/login", user_controller.login_get);

// GET signup page
router.get("/sign-up", user_controller.signup_get);

// POST signup
router.post("/sign-up", user_controller.signup_post);

router.post("/login", user_controller.login_post);

router.get("/logout", user_controller.logout_get);

module.exports = router;
