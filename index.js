const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const session = require("express-session");

const users = {};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: "keyboard cat", cookie: { maxAge: 60000 } }));

app.get("/", (req, res) => {
  res.send("homepage");
});

app.get("/register", (req, res) => {
  res.sendFile(path.resolve(__dirname, "register.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.resolve(__dirname, "login.html"));
});

app.get("/welcome", (req, res) => {
  console.log(req.session);
  if (req.session.user) {
    res.send(req.session.user + "hello");
    return;
  }
  res.send("welcome");
});

app.post("/api/login-action", (req, res) => {
  const loginInfo = req.body;
  if (!users[loginInfo.email]) {
    res.json({ status: "email doesn't exist" });
    return;
  }
  const shasum = crypto.createHash("sha1");
  shasum.update(loginInfo.psw);
  loginInfo.psw = shasum.digest("hex");
  if (users[loginInfo.email].psw == loginInfo.psw) {
    console.log(loginInfo, users);
    req.session.user = loginInfo.email;
    res.json({ status: "success" });
    return;
  }
  res.json({ status: "failed" });
});

app.post("/api/register-action", (req, res) => {
  if (users[req.body.email]) {
    res.send("user already exists");
    return;
  }
  if (req.body.psw != req.body.pswRepeat) {
    res.status(404).end();
    return;
  }
  const shasum = crypto.createHash("sha1");
  shasum.update(req.body.psw);
  req.body.psw = shasum.digest("hex");
  delete req.body.pswRepeat;
  users[req.body.email] = req.body;

  console.log(users);
  res.json(users);
});

app.get("*", (req, res) => {
  res.status(404).sendFile(path.resolve(__dirname, "404.html"));
});
app.listen(3000, () => {
  console.log(`Example app listening at http://localhost:3000`);
});
