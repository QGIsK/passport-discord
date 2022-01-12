/* eslint-disable require-jsdoc */
/* eslint-disable no-console */
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const Strategy = require("@qgisk/passport-discord").Strategy;
const { createPageRenderer } = require("vite-plugin-ssr");

const isProduction = process.env.NODE_ENV === "production";
const root = `${__dirname}/..`;

const { CLIENT_ID, CLIENT_SECRET, CALLBACK, PORT } = process.env;

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
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK,
      scope: scopes,
      prompt: prompt,
    },
    function (_accessToken, _refreshToken, profile, done) {
      process.nextTick(function () {
        return done(null, profile);
      });
    }
  )
);

startServer();

async function startServer() {
  const app = express();

  // Auth middleware
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
    "/discord/redirect",
    passport.authenticate("discord", { scope: scopes, prompt: prompt })
  );

  app.get(
    "/callback",
    passport.authenticate("discord", { failureRedirect: "/" }),
    (_req, res, next) => {
      // next here because our catchall with handle the rest
      return next();
    }
  );

  let viteDevServer;
  if (isProduction) {
    app.use(express.static(`${root}/dist/client`));
  } else {
    const vite = require("vite");
    viteDevServer = await vite.createServer({
      root,
      server: { middlewareMode: "ssr" },
    });
    app.use(viteDevServer.middlewares);
  }

  const renderPage = createPageRenderer({ viteDevServer, isProduction, root });

  app.get("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Check if req is authenticated, if not set to null, we base our middleware in index.page.server.js files.
    const user = req?.user ?? null;

    const pageContextInit = {
      user,
      // We make logged-in user information available to pages as `pageContext.user`
      url,
    };
    const pageContext = await renderPage(pageContextInit);

    if (pageContext.redirectTo)
      return res.redirect(307, pageContext.redirectTo);

    const { httpResponse } = pageContext;
    if (!httpResponse) return next();
    const { body, statusCode, contentType } = httpResponse;
    res.status(statusCode).type(contentType).send(body);
  });

  const port = PORT || 3000;
  app.listen(port);
  console.log(`Server running at http://localhost:${port}`);
}
