const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username cannot be blank"],
  },
  //Won't store anything as the real password
  hashed_password: {
    type: String,
    required: [true, "Need a password"],
  },
});

userSchema.statics.findAndValidate = async function (username, password) {
  //Look for user by username
  const foundUser = await this.findOne({ username });
  console.log(foundUser);

  //Compare the txt PW vs the hashed version in the DB
  const isValid = await bcrypt.compare(password, foundUser.hashed_password);
  console.log(isValid);

  //If pw=hash, return the user, else return false
  return isValid ? foundUser : false;
};

userSchema.pre("save", async function (next) {
  //do nothing if the password has not been changed
  if (!this.isModified("hashed_password")) return next();

  //changed the plain txt password to a hash "pre-save"
  this.hashed_password = await bcrypt.hash(this.hashed_password, 12);

  //do the next thing
  next();
});

module.exports = mongoose.model("User", userSchema);
