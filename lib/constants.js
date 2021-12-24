/**
 * @kind constant
 * @description Authorization url for discord oauth
 */

const authorizationURL = "https://discord.com/api/oauth2/authorize";

/**
 * @kind constant
 * @description Token url for discord oauth
 */
const tokenURL = "https://discord.com/api/oauth2/token";

/**
 * @kind constant
 * @description  Base user URL for discord oauth
 */
const userURL = "https://discord.com/api/users/@me";

module.exports = { authorizationURL, tokenURL, userURL };
