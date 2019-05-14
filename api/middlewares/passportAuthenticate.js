/**
 * Passport authentication
 * @module middlewares/passportAuthenticate
 * @requires passport
 */
const passport = require('passport');

module.exports = (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (err || !user) {
      if (info && info.name != null && info.name == 'TokenExpiredError') {
        jsonRes.msg = 'Token expired';
      } else {
        jsonRes.msg = 'Unauthorised';
      }
      res.json(jsonRes);
    } else {
      if (req.locals == null) {
        req.locals = {};
      }
      req.locals._info = info;
      next();
    }
  })(req, res, next);
};
