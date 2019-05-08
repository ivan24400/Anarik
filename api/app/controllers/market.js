/**
 * Market operations
 * @module app/controllers/market
 * @requires local:web3-helper
 */

const path = require('path');

const web3Helper = require('web3-helper');

const contracts = require(path.join(
  __dirname, '..', '..', 'contracts', 'instance.js'
));

const appConfig = require(path.join(
  __dirname, '..', '..', 'config', 'contracts', 'deploy', 'app.js'
));

const tknConfig = require(path.join(
  __dirname, '..', '..', 'config', 'contracts', 'deploy', 'token.js'
));

const USER_LOG_DELIMITER = '\u232c';

module.exports = {
  /**
   * Retrieve market details
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  getMarket: (req, res) => {
    if (req.session.username != null) {
      const jsonRes = {};
      jsonRes.success = false;
      jsonRes.status = 'success';
      jsonRes.data = [];

      // Get total number of items in the market
      contracts.get(appConfig.name).inst.getItemCount(
        {from: appConfig.acc_address},
        (err, result) => {
          if (!err) {
            const itemCount = parseInt(result.toString());

            const promItems = [];
            // Retrieve all items in market
            for (let index=0; index < itemCount; index++) {
              promItems.push(
                new Promise(resolve => {
                  contracts.get(appConfig.name).inst.getPublicMarketItem(
                    index,
                    req.session.username,
                    {from: appConfig.acc_address},
                    (err1, result1) => {
                      if (!err1) {
                        jsonRes.data.push({
                          'id': index,
                          'name': result1[0],
                          'description': result1[1],
                          'price': result1[2],
                          'owner': contracts
                            .get(appConfig.name)
                            .web3
                            .toUtf8(result1[3]),
                        });
                      }
                      resolve();
                    });
                }));
            }
            (async () => {
              await Promise.all(promItems);
              jsonRes.success = true;
              res.json(jsonRes);
            })();
          }
        });
    } else {
      jsonRes.msg = 'Unauthorised';
      res.status(401).json(jsonRes);
    }
  },

  /**
   * Buy an item from the market
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  buyItem: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.body.productIndex != null && req.session.user_account != null) {
      const itemIndex = req.body.productIndex;

      // Get items's essential details
      contracts.get(appConfig.name).inst.getItem(
        itemIndex,
        {from: appConfig.acc_address},
        (err1, result1) => {
          if (!err1) {
            // check if buyer has sufficient balance
            contracts.get(tknConfig.name).inst.balanceOf(
              req.session.user_account,
              {from: tknConfig.acc_address},
              (err2, result2) => {
                if (!err2) {
                  // if item price <= balance of user
                  const itemPrice = parseInt(result1[4].toString());
                  if (itemPrice <= parseInt(result2.toString())) {
                    const sellerName = result1[1];
                    const buyerAddr = req.session.user_account;
                    const sellerAddr = result1[0];

                    // Send tokens
                    let gasLimit = contracts
                      .get(tknConfig.name)
                      .inst
                      .sendTokens
                      .estimateGas(
                        buyerAddr,
                        sellerAddr,
                        itemPrice,
                        {from: tknConfig.acc_address}
                      );

                    gasLimit = Math.round(gasLimit + gasLimit*0.5);
                    gasLimit = `0x${gasLimit.toString(16)}`;

                    web3Helper.sendRawTransaction(
                      contracts.get(tknConfig.name).web3,
                      tknConfig.acc_pri_k,
                      tknConfig.acc_address,
                      null,
                      gasLimit,
                      tknConfig.acc_address,
                      contracts.get(tknConfig.name).inst.address,
                      contracts.get(tknConfig.name).inst.sendTokens.getData(
                        buyerAddr,
                        sellerAddr,
                        itemPrice
                      )
                    )
                      .then(receipt => {
                        if (receipt.status != 0x1) {
                          throw new Error('Transaction failed');
                        }
                        const buyerLog = 'P'+USER_LOG_DELIMITER +
                        sellerName +
                        USER_LOG_DELIMITER +
                        result1[2] +
                        USER_LOG_DELIMITER +
                        result1[3] +
                        USER_LOG_DELIMITER +
                        result1[4].toString();

                        const sellerLog = 'S'+USER_LOG_DELIMITER +
                        req.session.username +
                        USER_LOG_DELIMITER +
                        result1[2] +
                        USER_LOG_DELIMITER +
                        result1[3] +
                        USER_LOG_DELIMITER +
                        result1[4].toString();

                        const gasLimitCo = contracts
                          .get(appConfig.name)
                          .inst
                          .changeOwner
                          .estimateGas(
                            buyerAddr,
                            buyerLog,
                            sellerAddr,
                            sellerLog,
                            itemIndex
                          );

                        web3Helper.sendRawTransaction(
                          contracts.get(appConfig.name).web3,
                          appConfig.acc_pri_k,
                          appConfig.acc_address,
                          null,
                          gasLimitCo,
                          appConfig.acc_address,
                          contracts.get(appConfig.name).inst.address,
                          contracts
                            .get(appConfig.name)
                            .inst
                            .changeOwner
                            .getData(
                              buyerAddr,
                              buyerLog,
                              sellerAddr,
                              sellerLog,
                              itemIndex
                            )
                        )
                          .then(receipt => {
                            if (receipt.status != 0x1) {
                              throw new Error('Transaction failed');
                            }
                            jsonRes.success = true;
                            jsonRes.msg = 'Market item transacted successfully';
                          })
                          .catch(e => {
                            jsonRes.msg = 'Change ownership failed';
                            res.status(500);
                          })
                          .finally( () => {
                            res.json(jsonRes);
                          });
                      })
                      .catch(error => {
                        jsonRes.msg = 'Market item transaction failed';
                        res.status(500).json(jsonRes);
                      });
                  } else {
                    jsonRes.msg = 'Insufficient balance';
                    res.status(400).json(jsonRes);
                  }
                } else {
                  jsonRes.msg = 'Invalid user address';
                  res.status(400).json(jsonRes);
                }
              });
          } else {
            jsonRes.msg = 'Unable to retrieve item details';
            res.status(400).json(jsonRes);
          }
        });
    } else {
      jsonRes.msg = 'Unauthorised';
      res.status(401).json(jsonRes);
    }
  },
};
