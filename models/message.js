const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  title: { type: String, required: true, minLength: 3 },
  timeStamp: { type: Date, default: new Date() },
  text: { type: String, required: true, minLength: 8 },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("message", messageSchema);
