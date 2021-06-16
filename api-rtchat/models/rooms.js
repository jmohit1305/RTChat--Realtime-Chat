const mongoose = require("mongoose");

const roomScehema = mongoose.Schema({
  users: [],
  attachmentURL: [],
});

module.exports = mongoose.model("room", roomScehema);
