const express = require('express');
const router = express.Router();
const path = require('path');
const connect = require(path.join(__dirname,'..', 'network', 'connect.js'));

const appConfig = require(path.join(__dirname, '..', 'network', 'config', 'app.js'));
const userConfig = require(path.join(__dirname, '..', 'network', 'config', 'user.js'));
const tknConfig = require(path.join(__dirname, '..', 'network', 'config', 'token.js'));

/**
 * Admin login
 * @param {Object} req http request object
 * @param {Object} res http response object
 * @param {Object} next next-middleware function object
 * @param {Object} jsonRes Custom response object
 */
function adminLogin(req, res, next, jsonRes) {
  req.session.username = req.body.l_username;
  req.session.password = req.body.l_password;

  // Get total number of users
  connect.get(appConfig.name).inst.getUserCount(
    {from: appConfig.acc_address},
    (err1, result1) => {
      if (!err1) {
        const totalUsers = parseInt(result1.toString());
        const userArr = [];
        const userArrProms = [];
         
        // Get all username
        for (let _index = 0; _index < totalUsers; _index++) {
          userArrProms.push(
            new Promise((resolve, reject) => {
              connect.get(userConfig.name).inst.getUserNameAt(
                _index,
                {from: userConfig.acc_address},
                (err2, result2) => {
                  if (!err2) {
                    userArr.push(
                      connect.get(userConfig.name).web3.toUtf8(result2)
                    );
                  } else {
                    jsonRes.msg = 'User retrieval failed';
                    res.status(401).json(jsonRes);
                  }
                });
            }));
        }
       
        (async ()=>{
          await Promise.all(userArrProms);
        })();
       
        if (userArr) {
          // Get total tokens owned by the admin
          connect.get(tknConfig.name).inst.balanceOf(
            tknConfig.acc_address,
            {from: tknConfig.acc_address},
            (err4, result4) => {
              if (!err4) {             
                let requestsArr = [];
                // Get token request
                connect.get(tknConfig.name).inst.getTokenRequestCount(
                  {from: tknConfig.acc_address},
                  (err5, result5) => {
                    if (!err5) {
                      const totalRequests = parseInt(result5.toString());
                      const promiseArr = [];
                      // Get each request
                      for (let i=0; i<totalRequests; i++) {
                        const index = i;
                        promiseArr.push(
                          new Promise(resolve => {
                            connect.get(tknConfig.name).inst.getTokensDetailsAt(
                              index,
                              {from: tknConfig.acc_address},
                              (err6, result6) => {
                                if (!err6) {
                                  requestsArr.push({
                                    index: index,
                                    name: result6[0],
                                    address: result6[1],
                                    value: result6[2],
                                  });
                                }
                                resolve();
                              });
                          })
                        );
                      }
                      (async () => {
                        await Promise.all(promiseArr);
                        const reqAddr = new Set([]);
                        requestsArr = requestsArr.filter(
                          (item, index, arr) => {
                            if (reqAddr.has(item.address)) {
                              return false;
                            } else {
                              reqAddr.add(item.address);
                              return true;
                            }
                          });
                        jsonRes.success = true;
                        jsonRes.username = connect._admin;
                        jsonRes.snails = result4.toString();
                        jsonRes.users = userArr,
                        jsonRes.token_requests = requestsArr;
                        res.json(jsonRes);
                      })();
                    }
                  });
              } else {
                jsonRes.msg = 'User account balance retrieval failed';
                res.status(500).json(jsonRes);
              }
            });
        }
      } else {
        jsonRes.msg = 'Unable to access user\'s list';
        res.status(401).json(jsonRes);
      }
    });
}

/**
 * Normal user login
 * @param {Object} req http request object
 * @param {Object} res http response object
 * @param {Object} next next-middleware function object
 * @param {Object} jsonRes Custom response object
 */
function userLogin(req, res, next, jsonRes) {
  try {
    connect.get(userConfig.name).inst.verifyCredential(
      req.body.l_username,
      req.body.l_password,
      {from: userConfig.acc_address},
      (err, result) => {
        if (result) {
          let gasLimit = parseInt(connect.get(userConfig.name).inst.getUserAccAddr.estimateGas(
            req.body.l_username,
            {from: userConfig.acc_address}
          ));
  
          gasLimit = Math.round(gasLimit + gasLimit*0.2);
  
          connect.get(userConfig.name).inst.getUserAccAddr(
            req.body.l_username,
            {from: userConfig.acc_address, gas: gasLimit},
            (err2, result2) => {
              if (!err2) {
                // Get total tokens owned by the user
                connect.get(tknConfig.name).inst.balanceOf(
                  result2,
                  {from: tknConfig.acc_address},
                  (err3, result3) => {
                    if (!err3) {
                      req.session.username = req.body.l_username;
                      req.session.password = req.body.l_password;
                      req.session.user_account = result2;
      
                      jsonRes.success = true;
                      jsonRes.username = req.body.l_username;
                      jsonRes.snails = parseInt(result3.toString(10));
      
                      res.json(jsonRes);
                    } else {
                      jsonRes.msg = 'User account balance retrieval failed';
                      res.status(500).json(jsonRes);
                    }
                  });
              } else {
                jsonRes.msg = 'User account address retrieval failed';
                res.status(500).json(jsonRes);
              }
            });
        } else {
          jsonRes.msg = 'Invalid credentials';
          res.status(401).json(jsonRes);
        }
      });
  } catch (e) {
    jsonRes.msg = 'Something failed';
    res.status(500).json(jsonRes);
  }
}

/** Api home */
router.get('/', (req, res) =>  {
  res.json({msg: 'Anarik API v1'});
});

/** Authenticate a user */
router.post('/login', (req, res, next) =>  {
  const jsonRes = {};
  jsonRes.success = false;
  jsonRes.msg = 'NA';

  // Admin user
  if (
    req.body.l_username == connect._admin &&
    req.body.l_password == connect._admin_pass
  ) {
    adminLogin(req, res, next, jsonRes);
  } else {
    userLogin(req, res, next, jsonRes);
  }
});

/** Logout the user */
router.post('/logout',(req, res, next) => {
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
