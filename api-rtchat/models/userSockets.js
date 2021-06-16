const mongoose = require("mongoose");

const socketSchema = mongoose.Schema({
  userEmail: String,
  userSocketId: String,
});

module.exports = mongoose.model("userSocket", socketSchema);
