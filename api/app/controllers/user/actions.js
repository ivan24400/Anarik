/**
 * Manage user account(s)
 * @module app/controllers/user/actions
 * @requires local:web3-helper
 */

const web3Helper = require('web3-helper');

const contracts = require('../../../contracts/instance');

const userConfig = require('../../../config/contracts/deploy/user');
const tknConfig = require('../../../config/contracts/deploy/token');

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

    if (req.locals._info.account != null) {
      if (req.body.tokenCount != null) {
        if (!isNaN(req.body.tokenCount)) {
          let gasLimit = contracts
            .get(tknConfig.name)
            .inst
            .addTokenRequest
            .estimateGas(
              req.locals._info.user,
              req.locals._info.account,
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
              req.locals._info.user,
              req.locals._info.account,
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

    if (req.locals._info.user != null) {
      jsonRes.data = [];

      contracts.get(userConfig.name).inst.getLogCount(
        req.locals._info.user,
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
                    req.locals._info.user,
                    index,
                    {from: userConfig.acc_address},
                    (err2, result2) => {
                      if (!err2) {
                        const historyItemArr = result2.split('\u232c');
                        const historyItemObj = {};
                        historyItemObj.trade = historyItemArr[0];
                        historyItemObj.dealer = historyItemArr[1];
                        historyItemObj.name = historyItemArr[2];
                        historyItemObj.desc = historyItemArr[3];
                        historyItemObj.price = historyItemArr[4];
                        jsonRes.data.push(historyItemObj);
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
