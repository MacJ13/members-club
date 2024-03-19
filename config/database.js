const mongoose = require("mongoose");

require("dotenv").config();

const dev_db_url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@myatlasclusteredu.5v0vras.mongodb.net/members_club?retryWrites=true&w=majority`;

const mongoDB = process.env.MONGODB_URI || dev_db_url;

async function run() {
  await mongoose.connect(mongoDB).catch((err) => console.log(err));
  console.log("connect");
}

module.exports = run;
