/**
 * Manage user account(s)
 * @module app/controllers/user/actions
 * @requires local:web3-helper
 * @requires path
 */
const path = require('path');

const web3Helper = require('web3-helper');

const contracts = require(path.join(
  __dirname, '..', '..', '..', 'contracts', 'instance.js'
));

const userConfig = require(path.join(
  __dirname, '..', '..', '..', 'config', 'contracts', 'deploy', 'user.js'
));
const tknConfig = require(path.join(
  __dirname, '..', '..', '..', 'config', 'contracts', 'deploy', 'token.js'
));

module.exports = {

  /**
   * Request tokens from admin
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  requestTokens: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.session.userAccount != null) {
      if (req.body.tokenCount != null) {
        if (!isNaN(req.body.tokenCount)) {
          let gasLimit = contracts
            .get(tknConfig.name)
            .inst
            .addTokenRequest
            .estimateGas(
              req.session.username,
              req.session.userAccount,
              req.body.tokenCount,
              {from: tknConfig.acc_address}
            );

          gasLimit = Math.round(gasLimit + gasLimit*0.3);
          gasLimit = `0x${gasLimit.toString(16)}`;

          web3Helper.sendRawTransaction(
            contracts.get(tknConfig.name).web3,
            tknConfig.acc_pri_k,
            tknConfig.acc_address,
            null,
            gasLimit,
            tknConfig.acc_address,
            contracts.get(tknConfig.name).inst.address,
            contracts.get(tknConfig.name).inst.addTokenRequest.getData(
              req.session.username,
              req.session.userAccount,
              req.body.tokenCount
            )
          )
            .then(receipt => {
              if (receipt.status != 0x1) {
                throw new Error('Transaction failed');
              }
              jsonRes.success = true;
              jsonRes.msg = 'Token requested successfully';
              res.json(jsonRes);
            })
            .catch(error => {
              jsonRes.msg = 'Add token request failed';
              res.status(500).json(jsonRes);
            });
        } else {
          jsonRes.msg = 'Invalid token count';
          res.status(400).json(jsonRes);
        }
      } else {
        jsonRes.msg = 'Invalid input token count';
        res.status(400).json(jsonRes);
      }
    } else {
      jsonRes.msg = 'Invalid account';
      res.status(401).json(jsonRes);
    }
  },

  /**
   * Retrieve user's market item purchase history
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  purchaseHistory: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.session.username != null) {
      jsonRes.data = [];

      contracts.get(userConfig.name).inst.getLogCount(
        req.session.username,
        {from: userConfig.acc_address},
        (err1, result1) => {
          if (!err1) {
            const tokenCount = parseInt(result1.toString()); // BigNumber
            jsonRes.success = true;

            const logProms = [];

            let logListFlag = true;
            for (let index = 0; index < tokenCount && logListFlag; index++) {
              logProms.push(
                new Promise(resolve => {
                  contracts.get(userConfig.name).inst.getLog(
                    req.session.username,
                    index,
                    {from: userConfig.acc_address},
                    (err2, result2) => {
                      if (!err2) {
                        jsonRes.data.push(result2.split('\u232c'));
                      } else {
                        if (index == 0) {
                          logListFlag = false;
                          jsonRes.success = false;
                        }
                      }
                      resolve();
                    });
                }));
            }
            (async ()=> {
              await Promise.all(logProms);
              res.json(jsonRes);
            })();
          }
        });
    } else {
      jsonRes.msg = 'Unauthorised';
      res.status(401).json(jsonRes);
    }
  },
};
