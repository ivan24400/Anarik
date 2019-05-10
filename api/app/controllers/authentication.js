/**
 * Grant/Deny access to user
 * @module app/controllers/authentication
 */
const passport = require('passport');
const jwt = require('jsonwebtoken');

const contracts = require('../../contracts/instance.js');

const userTypesInfo = require('../../info/user-types.js');
const userConfig = require('../../config/contracts/deploy/user.js');
const jwtConfig = require('../../config/jwtConfig.js');

module.exports = {
  /**
   * Attempt an user login
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   * @param {Object} next - next middleware function object
   */
  login: (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
      if (user && !err) {
        const payload = {id: user};
        info.token = jwt.sign(payload, jwtConfig.secret);
        res.json(info);
      } else {
        const e = new Error();
        e.message = err.message;
        e.stack = err.stack;
        throw e;
      }
    })(req, res, next);
  },

  verify: (username, password, next) => {
    contracts.get(userConfig.name).inst.isUserAdmin(
      contracts.get(userConfig.name).web3.fromAscii(username),
      (err, result) => {
        if (err) {
          next(err, null);
        } else if (result) {
          contracts.get(userConfig.name).inst.verifyAdminCredential(
            username,
            password,
            (vAdminCredErr, vAdminCredRes) => {
              if (vAdminCredErr) {
                return next(vAdminCredErr, null);
              } else {
                return next(null, vAdminCredRes, {type: userTypesInfo.ADMIN});
              }
            });
        } else {
          contracts.get(userConfig.name).inst.verifyCredential(
            username,
            password,
            {from: userConfig.acc_address},
            (vCredErr, vCredRes) => {
              if (vCredErr) {
                return next(vCredErr, null);
              } else {
                return next(null, vCredRes, {type: userTypesInfo.REGULAR});
              }
            });
        }
      }
    );
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

    req.session.destroy(err => {
      if (err) {
        req.session = null;
        jsonRes.msg = 'Something failed';
      } else {
        jsonRes.success = true;
        jsonRes.msg = 'Logout successfully';
      }
      res.json(jsonRes);
    });
  },
};
