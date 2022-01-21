/**
 * Dependencies
 */
const OAuth2Strategy = require("passport-oauth2");
const InternalOAuthError = require("passport-oauth2").InternalOAuthError;
const Constants = require("./constants");

/**
 * Options for the Strategy.
 * @typedef {Object} StrategyOptions
 * @property {string} clientID
 * @property {string} clientSecret
 * @property {string} callbackURL
 * @property {Array} scope
 * @property {string} [authorizationURL="https://discord.com/api/oauth2/authorize"]
 * @property {string} [tokenURL="https://discord.com/api/oauth2/token"]
 * @property {string} [scopeSeparator=" "]
 */

/**
 * `Strategy` constructor.
 *
 * The Discord authentication strategy authenticates requests by delegating to
 * Discord via the OAuth2.0 protocol
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid. If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`       OAuth ID to discord
 *   - `clientSecret`   OAuth Secret to verify client to discord
 *   - `callbackURL`    URL that discord will redirect to after auth
 *   - `scope`          Array of permission scopes to request
 *                      Check the official documentation for valid scopes to pass as an array.
 *
 * @class
 */
class Strategy extends OAuth2Strategy {
  /**
   * Super needs options and verify, so we parse it before using 'this'.
   *
   * @param {StrategyOptions} options
   * @param {function} verify
   */
  constructor(options, verify) {
    const parsedOptions = options || {};

    parsedOptions.authorizationURL =
      options.authorizationURL || Constants.authorizationURL;

    parsedOptions.tokenURL = options.tokenURL || Constants.tokenURL;

    parsedOptions.scopeSeparator = options.scopeSeparator || " ";

    super(parsedOptions, verify);

    this.name = "discord";
    this._oauth2.useAuthorizationHeaderforGET(true);
  }

  /**
   * Retrieve user profile from Discord.
   *
   * This function constructs a normalized profile.
   * Along with the properties returned from /users/@me, properties returned include:
   *   - `connections`      Connections data if you requested this scope
   *   - `guilds`           Guilds data if you requested this scope
   *   - `fetchedAt`        When the data was fetched as a `Date`
   *   - `accessToken`      The access token used to fetch the (may be useful for refresh)
   *
   * @param {string} accessToken
   * @param {function} done
   */
  userProfile(accessToken, done) {
    const self = this;
    this._oauth2.get(Constants.userURL, accessToken, (err, body, _res) => {
      if (err) {
        return done(
          new InternalOAuthError("Failed to fetch the user profile.", err)
        );
      }

      try {
        const profile = JSON.parse(body);

        profile.provider = "discord";
        profile.accessToken = accessToken;

        self.checkScope("connections", accessToken, (err, connections) => {
          if (err) return done(err);
          if (connections) profile.connections = connections;

          self.checkScope("guilds", accessToken, (err, guilds) => {
            if (err) return done(err);
            if (guilds) profile.guilds = guilds;

            profile.fetchedAt = new Date();
            return done(null, profile);
          });
        });
      } catch (e) {
        return done(new Error("Failed to parse the user profile."));
      }
    });
  }

  /**
   * @param {string} scope
   * @param {string} accessToken
   * @param {function} cb
   *
   * @return {void}
   */
  checkScope(scope, accessToken, cb) {
    if (this._scope && this._scope.indexOf(scope) !== -1) {
      return this._oauth2.get(
        `${Constants.userURL}/${scope}`,
        accessToken,
        (err, body, _res) => {
          // Extra hint for rate limiting.
          if (err && err.statusCode === 429)
            return cb(
              new InternalOAuthError(`Reached rate limit getting ${scope}`, err)
            );

          // Normal error handling.
          if (err)
            return cb(
              new InternalOAuthError(`Failed to fetch user's ${scope}`, err)
            );

          try {
            const json = JSON.parse(body);
            return cb(null, json);
          } catch (e) {
            return cb(new Error(`Failed to parse user's ${scope}`));
          }
        }
      );
    }
    cb(null, null);
  }

  /**
   * Options for the authorization.
   * @typedef {Object} authorizationParams
   * @property {any} permissions
   * @property {any} prompt
   */

  /**
   * Return extra parameters to be included in the authorization request.
   *
   * @param {authorizationParams} options
   * @return {Object}
   */
  authorizationParams(options) {
    // Delete undefined options.
    Object.keys(options).forEach(
      (key) => options[key] === undefined && delete options[key]
    );
    return options;
  }
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
