/**
 * Grant/Deny access to user
 * @module app/controllers/authentication
 * @requires path
 */

const path = require('path');

const contracts = require(path.join(__dirname, '..', '..', 'contracts', 'instance.js'));

const userConfig = require(path.join(__dirname, '..', '..', 'config', 'contracts', 'deploy', 'user.js'));

const loginCntlr = require(path.join(__dirname, 'user', 'login.js'));

module.exports = {
  /**
   * Attempt an user login
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   * @param {Object} next - next middleware function object
   */
  login: (req, res, next) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';
  
    contracts.get(userConfig.name).inst.isUserAdmin(
      contracts.get(userConfig.name).web3.fromAscii(req.body.l_username),
      (err, result) => {
        if ( result || !err ) {
          loginCntlr.adminLogin(req, res, next);
        } else {
          loginCntlr.userLogin(req, res, next);
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
  
    req.session.destroy(function(err) {
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

}