# passport-discord

The original author(s) no longer seemed to maintain the package, This is a rewrite of both the originals in a more 'modern' fashion.

Passport strategy for authentication with [Discord](http://discordapp.com) through the OAuth 2.0 API.

Before using this strategy, it is strongly recommended that you read through the official docs page [here](https://discord.com/developers/docs/topics/oauth2), especially about the scopes and understand how the auth works.

## Is this much different than the other 2? 
Nope, only thing I've added is a seperate error when being rate limited by Discord. ( Note: This does not kill the auth process, when being rate limited on scopes. The 'scope' will simply be empty. ).

The rest works the same. ( I hope ;p )

## Why?
tbh I was just bored.

## Installation

```bash
npm install @qgisk/passport-discord --save # or pnpm add @qgisk/passport-discord
```

#### Configure Strategy
The Discord authentication strategy authenticates users via a Discord user account and OAuth 2.0 token(s). A Discord API client ID, secret and redirect URL must be supplied when using this strategy. The strategy also requires a `verify` callback, which receives the access token and an optional refresh token, as well as a `profile` which contains the authenticated Discord user's profile. The `verify` callback must also call `cb` providing a user to complete the authentication.

```javascript
const Strategy = require('@qgisk/passport-discord').Strategy;

const scopes = ["identify", "email", "connections", "guilds", "guilds.join"];
const prompt = "consent";

passport.serializeUser(function (user, done) {
  done(null, user);
});
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

passport.use(new Strategy({
    clientID: 'id',
    clientSecret: 'secret',
    callbackURL: 'callbackURL',
    scope: scopes,
    prompt: prompt,
},
(accessToken, refreshToken, profile, cb) => {
    User.findOrCreate({ discordId: profile.id }, (err, user) => {
        return cb(err, user);
    });
}));
```

#### Authentication Requests
Use `passport.authenticate()`, and specify the `'discord'` strategy to authenticate requests.

For example, as a route middleware in an Express app:

```javascript
app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/' // Failure
}), (req, res) => {
    res.redirect('/profile') // Success
});
```

##### Bot Authentication
If using the `bot` scope, the `permissions` option can be set to indicate
specific permissions your bot needs on the server ([permission codes](https://discordapp.com/developers/docs/topics/permissions)):

```javascript
app.get("/auth/discord", passport.authenticate("discord", { permissions: 66321471 }));
```
You can also determine the default guild by passing in a Guild Discord ID and toggle the appearance of the guilds dropdown,

```javascript
app.get("/auth/discord", passport.authenticate("discord", { disable_guild_select: true, guild_id: 'id' }));
```

#### Refresh Token Usage
In some use cases where the profile may be fetched more than once or you want to keep the user authenticated, refresh tokens may wish to be used. A package such as `passport-oauth2-refresh` can assist in doing this.

Example:

```bash
npm install passport-oauth2-refresh --save # or pnpm add passport-oauth2-refresh
```

```javascript
const passport = require('passport')
const DiscordStrategy = require('passport-discord').Strategy
const Refresh = require('passport-oauth2-refresh');

const discordStrategy = new DiscordStrategy({
    clientID: 'id',
    clientSecret: 'secret',
    callbackURL: 'callbackURL'
  },
  (accessToken, refreshToken, profile, cb) => {
    profile.refreshToken = refreshToken; // store this for later use
    User.findOrCreate({ discordId: profile.id }, (err, user) => {
        if (err)
            return done(err);

        return cb(err, user);
    });
});

passport.use(discordStrategy);
refresh.use(discordStrategy);
```

Then when refreshing the token

```javascript
refresh.requestNewAccessToken('discord', profile.refreshToken, (err, accessToken, refreshToken) => {
    if (err)
        throw Error(error);
    
    profile.accessToken = accessToken;  // Store this
});
```


## Examples
The examples can be found in the `/examples` directory.

Be sure to `npm i` or `pnpm i`

Theres an example for a simple Express setup, and one with vite-plugin-ssr ( This one is with Vue but can be easily adapted).

## Credits
* [Jared Hanson](https://github.com/jaredhanson) -Author of Passport
* [Nicolas Tay](https://github.com/nicholastay) - Original author of this package
* [tonestrike](https://github.com/tonestrike/) - Original fork

## License
Licensed under the [MIT](https://github.com/QGIsK/passport-discord/blob/main/LICENSE) license. 
