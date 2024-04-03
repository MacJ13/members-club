const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Message = require("../models/message");

const message_controller = require("../controllers/messageController");
const user_contorller = require("../controllers/userController");
require("dotenv").config();

router.get("/:id/message/all", message_controller.message_list);

router.get("/:id/join", user_contorller.user_memberclub_get);

router.post("/:id/join", user_contorller.user_memberclub_post);

router.get("/:id/message/create", message_controller.message_create_get);

router.post("/:id/message/create", message_controller.message_create_post);

router.get(
  "/:id/message/:messageId/update",
  message_controller.message_update_get
);

router.post(
  "/:id/message/:messageId/update",
  message_controller.message_update_post
);

/* GET users listing. */
router.get("/:id", user_contorller.user_index);

module.exports = router;
