const express = require("express");
const session = require("express-session");
const passport = require("passport");
const Strategy = require("../lib").Strategy;
const app = express();

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

const scopes = ["identify", "email", "connections", "guilds", "guilds.join"];
const prompt = "consent";

passport.use(
  new Strategy(
    {
      clientID: "923658600872837130",
      clientSecret: "YPpiZb4gDxyj2pjHAx-Kn9EnV1B7M4HP",
      callbackURL: "http://localhost:5000/callback",
      scope: scopes,
      prompt: prompt,
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        return done(null, profile);
      });
    }
  )
);

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.get(
  "/",
  passport.authenticate("discord", { scope: scopes, prompt: prompt }),
  function (req, res) {}
);
app.get(
  "/callback",
  passport.authenticate("discord", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("/info");
  } // auth success
);
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});
app.get("/info", checkAuth, function (req, res) {
  // console.log(req.user)
  res.json(req.user);
});

function checkAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.send("not logged in :(");
}

app.listen(5000, function (err) {
  if (err) return console.log(err);
  console.log("Listening at http://localhost:5000/");
});
