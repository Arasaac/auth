"use strict";

const jwt = require("jsonwebtoken");
const db = require("./db");
const Client = require("./db/clients");
const validate = require("./validate");

/**
 * This endpoint is for verifying a token.  This has the same signature to
 * Google's token verification system from:
 * https://developers.google.com/accounts/docs/OAuth2UserAgent#validatetoken
 *
 * You call it like so
 * https://localhost:3000/api/tokeninfo?access_token=someToken
 *
 * If the token is valid you get returned
 * {
 *   "audience": someClientId
 * }
 *
 * If the token is not valid you get a 400 Status and this returned
 * {
 *   "error": "invalid_token"
 * }
 * @param   {Object}  req - The request
 * @param   {Object}  res - The response
 * @returns {Promise} Returns the promise for testing only
 */
exports.info = (req, res) => {
  console.log(req.query.access_token);
  const token = req.query.access_token;
  return validate
    .tokenForHttp(token)
    .then(() => validate.tokenExistsForHttp(token))
    .then(token => {
      const { iss, sub, aud, role, exp, scope } = jwt.decode(token);
      const now = Date.now() / 1000;
      const expirationLeft = exp < now ? 0 : exp - now;
      res.json({ audience: aud, expires_in: expirationLeft });
    })

    .catch(err => {
      res.status(err.status);
      res.json({ error: err.message });
    });
};

/**
 * This endpoint is for revoking a token.  This has the same signature to
 * Google's token revocation system from:
 * https://developers.google.com/identity/protocols/OAuth2WebServer
 *
 * You call it like so
 * https://localhost:3000/api/revoke?token=someToken
 *
 * If the token is valid you get returned a 200 and an empty object
 * {}
 *
 * If the token is not valid you get a 400 Status and this returned
 * {
 *   "error": "invalid_token"
 * }
 * This will first try to delete the token as an access token.  If one is not found it will try and
 * delete the token as a refresh token.  If both fail then an error is returned.
 * @param   {Object}  req - The request
 * @param   {Object}  res - The response
 * @returns {Promise} Returns the promise for testing
 */
exports.revoke = (req, res) =>
  validate
    .tokenForHttp(req.query.token)
    .then(() => db.accessTokens.delete(req.query.token))
    .then(token => {
      if (token == null) {
        return db.refreshTokens.delete(req.query.token);
      }
      return token;
    })
    .then(tokenDeleted => validate.tokenExistsForHttp(tokenDeleted))
    .then(() => {
      res.json({});
    })
    .catch(err => {
      res.status(err.status);
      res.json({ error: err.message });
    });
