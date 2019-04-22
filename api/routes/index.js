const express = require('express');
const router = express.Router();
const path = require('path');

const connect = require(path.join(__dirname, '..', 'network', 'connect.js'));

// const appConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'app.js'));
const userConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'user.js'));
// const tknConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'token.js'));

const loginCntlr = require(path.join(__dirname, '..', 'app', 'controllers', 'user', 'login.js'));


/** Api home */
router.get('/', (req, res) => {
  res.json({msg: 'Anarik API v1'});
});

/** Authenticate a user */
router.post('/login', (req, res, next) => {
  const jsonRes = {};
  jsonRes.success = false;
  jsonRes.msg = 'NA';

  connect.get(userConfig.name).inst.isUserAdmin(
    connect.get(userConfig.name).web3.fromAscii(req.body.l_username),
    (err, result) => {
      if ( result || !err ) {
        loginCntlr.adminLogin(req, res, next);
      } else {
        loginCntlr.userLogin(req, res, next);
      }
    }
  );
});

/** Logout the user */
router.post('/logout', (req, res, next) => {
  const jsonRes = {};
  jsonRes.success = false;
  jsonRes.msg = 'Logout successfully';

  req.session.destroy(function(err) {
    if (err) {
      req.session = null;
      jsonRes.msg = 'Something failed';
    } else {
      jsonRes.success = true;
    }
    res.json(jsonRes);
  });
});

module.exports = router;
