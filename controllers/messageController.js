const Message = require("../models/message");
const User = require("../models/user");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.message_list = asyncHandler(async (req, res, next) => {
  const logged = Boolean(req.user);

  if (!logged) {
    res.redirect("/");
    return;
  }

  const messagesByUser = await Message.find({ user: req.params.id }).exec();

  res.render("message_list", {
    title: "Message List",
    user: req.user,
    logged: logged,
    messages: messagesByUser,
  });
});
