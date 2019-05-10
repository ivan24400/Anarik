const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;

const contracts = require('../contracts/instance');
const authCtlr = require('../app/controllers/authentication');
const loginCntlr = require('../app/controllers/user/login');
const userConfig = require('../config/contracts/deploy/user');

const jwtConfig = require('../config/jwtConfig');

const userTypesInfo = require('../info/user-types');


module.exports = () => {
  const ExtractJwt = passportJWT.ExtractJwt;
  const JwtStrategy = passportJWT.Strategy;

  const jwtOptions = {};
  jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  jwtOptions.secretOrKey = jwtConfig.secret;

  passport.use('login', new LocalStrategy(
    {
      usernameField: 'l_username',
      passwordField: 'l_password',
      session: false,
    },
    (username, password, done) => {
      authCtlr.verify(username, password, (err, user, info) => {
        if (err) {
          return done(err, null);
        } else if (info.type == userTypesInfo.ADMIN) {
          try {
            let result;
            (async ()=> {
              result = await loginCntlr.adminLogin(username, password);
            })();
            return done(null, username, result);
          } catch (e) {
            return done(e, null);
          }
        } else if (info.type == userTypesInfo.REGULAR) {
          try {
            let result;
            (async ()=> {
              result = await loginCntlr.userLogin(username, password);
            })();
            return done(null, username, result);
          } catch (e) {
            return done(e, null);
          }
        }
      });
    }
  ));

  passport.use('jwt', new JwtStrategy(jwtOptions, (jwtPayload, next) => {
    console.log('payload received', jwtPayload);

    contracts.get(userConfig.name).inst.isUserAdmin(
      contracts.get(userConfig.name).web3.fromAscii(jwtPayload.username),
      (err, result) => {
        if (err) {
          next(null, null);
        } else if (result) {
          contracts.get(userConfig.name).inst.verifyAdminCredential(
            jwtPayload.username,
            jwtPayload.password,
            (vAdminCredErr, vAdminCredRes) => {
              if (vAdminCredErr) {
                return next(vAdminCredErr, null);
              } else {
                req.locals._info = {
                  utype: 'admin',
                  login: vAdminCredRes,
                };
                return next(null, vAdminCredRes);
              }
            });
        } else {
          contracts.get(userConfig.name).inst.verifyCredential(
            jwtPayload.username,
            jwtPayload.password,
            {from: userConfig.acc_address},
            (vCredErr, vCredRes) => {
              if (vCredErr) {
                return next(vCredErr, null);
              } else {
                req.locals._info = {
                  utype: 'regular',
                  login: vCredRes,
                };
                return next(null, vCredRes);
              }
            });
        }
      }
    );
  }));
};
