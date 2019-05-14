/**
 * Grant/Deny access to user
 * @module app/controllers/authentication
 * @requires passport
 * @requires jsonwebtoken
 */
const passport = require('passport');
const jwt = require('jsonwebtoken');

const contracts = require('../../contracts/instance');
const redisClient = require('../../cache/redis');

const userTypesInfo = require('../../info/user-types');
const userConfig = require('../../config/contracts/deploy/user');
const accessToken = require('../../config/access-token');
const jwtConfig = require('../../config/jwt-config');

const errMsgs = require('../../lib/error-msgs');
const errSimplify = require('../../lib/error-simple');

module.exports = {
  /**
   * Attempt an user login
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   * @param {Object} next - next middleware function object
   */
  login: (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
      if (user && !err && info) {
        // Token will expire in 1 hour
        const payload = {
          exp: Math.floor(Date.now() / 1000 + accessToken.accessTokenExp),
          user: user,
        };
        info.token = jwt.sign(payload, jwtConfig.secret);
        // Refresh token will expire in 2 days
        const refPayload = {
          exp: Math.floor(Date.now() / 1000 + accessToken.refreshTokenExp),
          user: user,
        };
        info.refreshToken = jwt.sign(refPayload, jwtConfig.secret);
        res.json(info);
      } else {
        if (!err) {
          res.json({
            success: false,
            msg: errMsgs['1'],
          });
        } else {
          res.json({
            success: false,
            msg: errSimplify(err),
          });
        }
      }
    })(req, res, next);
  },

  /**
   * Verify user credentials
   * @param {string} username - username credential
   * @param {string} password - password credential
   * @param {Object} next - callback, for next verification stage
   */
  verify: (username, password, next) => {
    contracts.get(userConfig.name).inst.isUserAdmin(
      contracts.get(userConfig.name).web3.fromAscii(username),
      (err, result) => {
        if (err && err.message.indexOf('User') == -1) {
          next(err, null);
        } else if (result) {
          contracts.get(userConfig.name).inst.verifyAdminCredential(
            username,
            password,
            (vAdminCredErr, vAdminCredRes) => {
              if (!vAdminCredRes) {
                return next(vAdminCredErr, null);
              } else {
                return next(null, username, {type: userTypesInfo.ADMIN});
              }
            });
        } else {
          contracts.get(userConfig.name).inst.verifyCredential(
            username,
            password,
            {from: userConfig.acc_address},
            (vCredErr, vCredRes) => {
              if (!vCredRes) {
                return next(vCredErr, null);
              } else {
                return next(null, username, {type: userTypesInfo.REGULAR});
              }
            });
        }
      }
    );
  },

  /**
   * Refresh an user's token
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  refreshToken: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    redisClient.exists(
      `users:${req.locals._info.user}`,
      (err, redisRes) => {
        if (err || redisRes == 0) {
          jsonRes.msg = 'Invalid user';
          res.json(jsonRes);
        } else {
          // Expire token in 1 hour
          const payload = {
            exp: Math.floor(Date.now() / 1000) + accessToken.accessTokenExp,
            user: req.locals._info.user,
          };
          jsonRes.success = true;
          jsonRes.token = jwt.sign(payload, jwtConfig.secret);
          res.json(jsonRes);
        }
      });
  },

  /**
   * Remove user's session
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   * @param {Object} next - next middleware function object
   */
  logout: (req, res, next) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    redisClient.del(`users:${req.locals._info.user}`, (err, redisRes) => {
      if (err) {
        jsonRes.msg = 'Something failed';
      } else {
        jsonRes.success = true;
        jsonRes.msg = 'Logout successfully';
      }
      res.json(jsonRes);
    });
  },
};
