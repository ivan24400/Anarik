/**
 * Passport JWT middleware
 * @module middlewares/passport
 * @requires passport
 * @requires passport-jwt
 * @requires passport-local
 */
const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;

const redisClient = require('../cache/redis');
const contracts = require('../contracts/instance');
const authCtlr = require('../app/controllers/authentication');
const loginCntlr = require('../app/controllers/user/login');

const userConfig = require('../config/contracts/deploy/user');
const jwtConfig = require('../config/jwt-config');

const userTypesInfo = require('../info/user-types');


module.exports = () => {
  // Setup login strategy
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
              done(null, username, result);
            })();
            // return done(null, username, result);
          } catch (e) {
            return done(e, null);
          }
        } else if (info.type == userTypesInfo.REGULAR) {
          try {
            let result;
            (async ()=> {
              result = await loginCntlr.userLogin(username, password);
              done(null, username, result);
            })();
            // return done(null, username, result);
          } catch (e) {
            return done(e, null);
          }
        }
      });
    }
  ));

  // Setup authentication strategy
  const ExtractJwt = passportJWT.ExtractJwt;
  const JwtStrategy = passportJWT.Strategy;

  const jwtOptions = {};
  jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
  jwtOptions.secretOrKey = jwtConfig.secret;

  passport.use('jwt', new JwtStrategy(jwtOptions, (jwtPayload, next) => {
    console.log('payload received', jwtPayload);

    contracts.get(userConfig.name).inst.isUserAdmin(
      contracts.get(userConfig.name).web3.fromAscii(jwtPayload.user),
      (err, result) => {
        if (err && err.message.indexOf('User') == -1) {
          next(null, null);
        } else if (result) {
          contracts.get(userConfig.name).inst.verifyAdminCredential(
            jwtPayload.user,
            jwtPayload.password,
            (vAdminCredErr, vAdminCredRes) => {
              if (vAdminCredErr) {
                return next(vAdminCredErr, null);
              } else {
                req.locals._info = {
                  utype: 'admin',
                  login: vAdminCredRes,
                };
                return next(null, vAdminCredRes, {user: jwtPayload.user});
              }
            });
        } else {
          redisClient.hmget(
            `users:${jwtPayload.user}`,
            ['password', 'account'],
            (err, userDetails) => {
              if (err || !userDetails[1]) {
                if (!err) {
                  err = new Error('User is logged out');
                }
                return next(err, null);
              } else {
                contracts.get(userConfig.name).inst.verifyCredential(
                  jwtPayload.user,
                  userDetails[0],
                  (vCredErr, vCredRes) => {
                    if (vCredErr) {
                      return next(vCredErr, null);
                    } else {
                      return next(
                        null,
                        vCredRes,
                        {
                          user: jwtPayload.user,
                          password: userDetails[0],
                          account: userDetails[1],
                        }
                      );
                    }
                  });
              }
            });
        }
      }
    );
  }));
};
