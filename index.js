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
app.use(session({ secret: "notagoodsecret", saveUninitialized: true }));

app.get("/", (req, res) => {
  res.send("HOMEPAGE");
});

// Goes to the register form
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10); //hash normal plain txt password
  const user = new User({
    username: username,
    hashed_password: hash,
  });
  await user.save();
  res.redirect("/");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  //Compare the plain txt pw vs the hashed one in the DB
  const validPassword = await bcrypt.compare(password, user.hashed_password);

  if (validPassword) {
    req.session.user_id = user._id; //If you logged in, your user id will be stored in the session
    res.redirect("/secret");
  } else {
    res.redirect("/login");
  }
});

app.get("/secret", (req, res) => {
  //Login functionality, stored in session user ID
  // if no userID, redirect to login, else show secret page
  if (!req.session.user_id) {
    return res.redirect("/login"); //return so only one works (redirect vs render)
  }
  res.render("secret");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  req.session.destroy();
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Serving on port 3000!");
});
