/**
 * User login
 * @module app/controllers/user/login
 * @requires path
 */

const contracts = require('../../../contracts/instance');

const redisClient = require('../../../cache/redis');

const userConfig = require('../../../config/contracts/deploy/user');
const tknConfig = require('../../../config/contracts/deploy/token');


module.exports = {

  /**
   * Normal user login
   * @param {string} username - http request object
   * @param {string} password - http response object
   * @return {Object} A promise when resolved returns user info, else an error message
   */
  userLogin: (username, password) => {
    return new Promise((resolve, reject) => {
      const jsonRes = {};
      jsonRes.success = false;
      jsonRes.msg = 'NA';
  
      try {
        contracts.get(userConfig.name).inst.verifyCredential(
          username,
          password,
          {from: userConfig.acc_address},
          (err, result) => {
            if (result) {
              let gasLimit = contracts
                .get(userConfig.name)
                .inst
                .getUserAccAddr
                .estimateGas(
                  username,
                  {from: userConfig.acc_address}
                );
  
              gasLimit = Math.round(gasLimit + gasLimit*0.2);
              gasLimit = `0x${gasLimit.toString(16)}`;
  
              contracts.get(userConfig.name).inst.getUserAccAddr(
                username,
                {from: userConfig.acc_address, gas: gasLimit},
                (err2, result2) => {
                  if (!err2) {
                    // Get total tokens owned by the user
                    contracts.get(tknConfig.name).inst.balanceOf(
                      result2,
                      {from: tknConfig.acc_address},
                      (err3, result3) => {
                        if (!err3) {
                          // req.session.username = username;
                          // req.session.password = password;
                          // req.session.userAccount = result2;
  
                          redisClient.hmset(
                            username,
                            {
                              passwd: password,
                              account: result2,
                            }
                          );
  
                          jsonRes.success = true;
                          jsonRes.username = username;
                          jsonRes.snails = parseInt(result3.toString(10));
  
                          resolve(jsonRes);
                        } else {
                          jsonRes.msg = 'User account balance retrieval failed';
                          reject(jsonRes);
                        }
                      });
                  } else {
                    jsonRes.msg = 'User account address retrieval failed';
                    reject(jsonRes);
                  }
                });
            } else {
              jsonRes.msg = 'Invalid credentials';
              reject(jsonRes);
            }
          });
      } catch (e) {
        jsonRes.msg = 'Something failed';
        reject(jsonRes);
      }
    });
  },

  /**
   * Admin login
   * @param {string} username - http request object
   * @param {string} password - http response object
   * @return {Object} A promise when resolved returns user info, else an error message
   */
  adminLogin: (username, password) => {
    return new Promise((resolve, reject) => {
      const jsonRes = {};
      jsonRes.success = false;
      jsonRes.msg = 'NA';
  
      contracts.get(userConfig.name).inst.getAdminAccAddr(
        username,
        password,
        (err0, resAdminAcc) => {
          if (!resAdminAcc) {
            jsonRes.msg = 'Unauthorised';
            res.status(401).json(jsonRes);
          } else {
            // Setup session
            // req.session.username = username;
            // req.session.password = password;
            // req.session.userAccount = resAdminAcc;
  
            redisClient.hmset(
              username,
              {
                passwd: password,
                account: resAdminAcc,
              }
            );
  
            // Get total number of users
            contracts.get(userConfig.name).inst.getUserCount(
              {from: userConfig.acc_address},
              (err1, result1) => {
                if (!err1) {
                  const totalUsers = parseInt(result1.toString());
                  const userArr = [];
                  const userArrProms = [];
  
                  // Get all username
                  for (let _index = 0; _index < totalUsers; _index++) {
                    userArrProms.push(
                      new Promise((resolve, reject) => {
                        contracts.get(userConfig.name).inst.getUserNameAt(
                          _index,
                          {from: userConfig.acc_address},
                          (err2, result2) => {
                            if (!err2) {
                              userArr.push(
                                contracts
                                  .get(userConfig.name)
                                  .web3
                                  .toUtf8(result2)
                              );
                            }
                          });
                      }));
                  }
  
                  (async ()=>{
                    await Promise.all(userArrProms);
                  })();
  
                  if (userArr) {
                    // Get total tokens owned by the admin
                    contracts.get(tknConfig.name).inst.balanceOf(
                      resAdminAcc,
                      {from: tknConfig.acc_address},
                      (err4, result4) => {
                        if (!err4) {
                          const requestsArr = [];
                          // Get token request
                          contracts.get(tknConfig.name).inst.getTokenRequestCount(
                            {from: tknConfig.acc_address},
                            (err5, result5) => {
                              if (!err5) {
                                const totalRequests = parseInt(
                                  result5.toString()
                                );
                                const promiseArr = [];
                                // Get each request
                                for (let i=0; i<totalRequests; i++) {
                                  const index = i;
                                  promiseArr.push(
                                    new Promise(resolveDetails => {
                                      contracts
                                        .get(tknConfig.name)
                                        .inst
                                        .getTokensDetailsAt(
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
                                            resolveDetails();
                                          });
                                    })
                                  );
                                }
                                (async () => {
                                  await Promise.all(promiseArr);
                                  
                                  jsonRes.success = true;
                                  jsonRes.username = username;
                                  jsonRes.snails = result4.toString();
                                  jsonRes.users = userArr,
                                  jsonRes.tokenRequests = requestsArr;
                                  resolve(jsonRes);
                                })();
                              }
                            });
                        } else {
                          jsonRes.msg = 'User account balance retrieval failed';
                          reject(jsonRes);
                        }
                      });
                  }
                } else {
                  jsonRes.msg = 'Unable to access user\'s list';
                  reject(jsonRes);
                }
              });
          }
        }
      );
    });
  },
};
