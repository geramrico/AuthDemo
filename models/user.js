const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username cannot be blank"],
  },
  hashed_password: {
    type: String,
    required: [true, "Need a password"],
  },
});

module.exports = mongoose.model('User',userSchema)