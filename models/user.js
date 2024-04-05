const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: { type: String, required: true, minLength: 6 },
  nickname: { type: String, required: true, minLength: 3 },
  password: { type: String, required: true },
  membership_status: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
  messages: [{ type: Schema.Types.ObjectId, ref: "message" }],
});

userSchema.virtual("url").get(function () {
  return `/user/${this._id}`;
});

module.exports = mongoose.model("user", userSchema);
