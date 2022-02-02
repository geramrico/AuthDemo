const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const User = require("./models/user");

mongoose
  .connect("mongodb://localhost:27017/authDemo")
  .then(() => {
    console.log("Mongo Connection open");
  })
  .catch((err) => {
    console.log("Connection faield");
    console.log(err);
  });

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.urlencoded({ extended: true })); //To parse requests body
app.use(session({ secret: "notagoodsecret", saveUninitialized: false }));

const requireLogin = (req, res, next) => {
  //If no  session id, send to login page
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  next();
};

app.get("/", (req, res) => {
  res.send("HOMEPAGE");
});

// Goes to the register form
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  //const hash = await bcrypt.hash(password, 10); //hash normal plain txt password
  //   const user = new User({
  //     username: username,
  //     hashed_password: hash,
  //   });

  //Instead of hashing here...
  //PRE MIDDLEWARE HASHES ON "PRE-SAVE"

  console.log(`${username} ${password}`);

  //   ORIGINAL
  const user = new User({
    username: username,
    hashed_password: password,
  });
  console.log(user);
  await user.save();
  console.log(user);
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  //Compare the plain txt pw vs the hashed one in the DB
  //   const user = await User.findOne({ username });
  //   const validPassword = await bcrypt.compare(password, user.hashed_password);

  //Replaced previous 2 lines for this 👇 creating a Model Method
  const foundUser = await User.findAndValidate(username, password);

  if (foundUser) {
    req.session.user_id = foundUser._id; //If you logged in, your user id will be stored in the session
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});

app.get("/secret", requireLogin, (req, res) => {
  res.render("secret");
});

app.post("/logout", (req, res) => {
  //on logout, delete session
  req.session.user_id = null;
  req.session.destroy();
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Serving on port 3000!");
});
