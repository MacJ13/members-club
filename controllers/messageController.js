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

exports.message_create_get = asyncHandler(async (req, res, next) => {
  const logged = Boolean(req.user);
  res.render("message_create", {
    title: "Create Message",
    logged: logged,
    user: req.user,
  });
});

exports.message_create_post = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Message title must not be empty")
    .isLength({ min: 3 })
    .withMessage("Message title must contain at least 3 characters")
    .escape(),
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Message text must not be empty")
    .isLength({ min: 8 })
    .withMessage("Message text must contain at least 8 characters")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const logged = Boolean(req.user);

    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      user: req.params.id,
      timeStamp: new Date(),
    });

    if (!errors.isEmpty()) {
      res.render(
        req.user.url + "/message/create",
        res.render("message_create", {
          title: "Create Message",
          message: message,
          logged: logged,
          errors: errors.array(),
        })
      );
      return;
    } else {
      await message.save();

      res.redirect(req.user.url + "/message/all");
      // const user = await User.findById(req.params.id).exec();

      // console.log("user => ", user);
      // res.send("create message!");
    }
  }),
];

exports.message_update_get = asyncHandler(async (req, res, next) => {
  const logged = Boolean(req.user);

  const message = await Message.findById(req.params.messageId).exec();

  if (!message) {
    return next(new Error("message not found"));
  }

  res.render("message_update", {
    title: "Update Message",
    logged: logged,
    user: req.user,
    message: message,
  });
});

exports.message_update_post = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Message title must not be empty")
    .isLength({ min: 3 })
    .withMessage("Message title must contain at least 3 characters")
    .escape(),
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Message text must not be empty")
    .isLength({ min: 8 })
    .withMessage("Message text must contain at least 8 characters")
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const logged = Boolean(req.user);

    const message = new Message({
      title: req.body.title,
      text: req.body.text,
      user: req.params.id,
      timeStamp: new Date(),
      _id: req.params.messageId,
    });

    if (!errors.isEmpty()) {
      res.render(
        req.user.url + "/message/create",
        res.render("message_create", {
          title: "Create Message",
          message: message,
          logged: logged,
          errors: errors.array(),
        })
      );
      return;
    } else {
      const updateMessage = await Message.findById(req.params.messageId).exec();

      updateMessage.title = message.title;
      updateMessage.text = message.text;
      updateMessage.timeStamp = new Date();
      await updateMessage.save();

      res.redirect(req.user.url + "/message/all");
    }
  }),
];

exports.message_delete_get = asyncHandler(async (req, res, next) => {
  const logged = Boolean(req.user);

  const message = await Message.findById(req.params.messageId)
    .sort({ timeStamp: -1 })
    .exec();

  if (!message) {
    return next(new Error("message not found"));
  }

  res.render("message_delete", {
    title: "Delete Message",
    logged: logged,
    user: req.user,
    message: message,
  });
});
