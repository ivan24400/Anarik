const express = require('express');
const router = express.Router();
const path = require('path');

const web3Helper = require('web3-helper');

const connect = require(path.join(__dirname, '..', 'network', 'connect.js'));
const appConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'app.js'));
const tknConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'token.js'));

/** Market Details */
router.get('/', (req, res, next) => {
  if (req.session.username != null) {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.status = 'success';
    jsonRes.data = [];

    // Get total number of items in the market
    connect.get(appConfig.name).inst.getItemCount(
      {from: appConfig.acc_address},
      (err, result) => {
        if (!err) {
          const itemCount = parseInt(result.toString());

          const promItems = [];

          for (let index=0; index < itemCount; index++) {
            promItems.push(
              new Promise(function(resolve) {
                connect.get(appConfig.name).inst.getPublicMarketItem(
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
                        'owner': connect.get(appConfig.name).web3.toUtf8(result1[3]),
                      });
                    }
                    resolve();
                  });
              }));
          }
          (async () =>{
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
});

/**
 * Buy an item from the market
 */
router.post('/buy-item', (req, res, next) => {
  const jsonRes = {};
  jsonRes.success = false;
  jsonRes.msg = 'NA';

  if (req.session.username != null && req.session.user_account != null) {
    const itemIndex = req.body.index;

    // Get items's essential details
    connect.get(appConfig.name).inst.getItem(
      itemIndex,
      {from: appConfig.acc_address},
      (err1, result1) => {
        if (!err1) {
          // check if buyer has sufficient balance
          connect.get(tknConfig.name).inst.balanceOf(
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
                  let gasLimit = parseInt(connect.get(tknConfig.name).inst.sendTokens.estimateGas(
                    sellerAddr,
                    buyerAddr,
                    itemPrice,
                    {from: tknConfig.acc_address}
                  ));

                  gasLimit = Math.round(gasLimit + gasLimit*0.5);

                  web3Helper.sendRawTransaction(
                    connect.get(tknConfig.name).web3,
                    tknConfig.acc_pri_k,
                    tknConfig.acc_address,
                    null,
                    gasLimit,
                    tknConfig.acc_address,
                    connect.get(tknConfig.name).inst.address,
                    connect.get(tknConfig.name).inst.sendTokens.getData(
                      buyerAddr,
                      sellerAddr,
                      itemPrice
                    )
                  )
                    .then(receipt => {
                      const buyerLog = 'P\u232c'+sellerName+'\u232c'+result1[2]+'\u232c'+result1[3]+'\u232c'+result1[4].toString();
                      const sellerLog = 'S\u232c'+req.session.username+'\u232c'+result1[2]+'\u232c'+result1[3]+'\u232c'+result1[4].toString();

                      const gasEstimate = connect.get(appConfig.name).inst.changeOwner.estimateGas(
                        buyerAddr,
                        buyerLog,
                        sellerAddr,
                        sellerLog,
                        itemIndex
                      );

                      web3Helper.sendRawTransaction(
                        connect.get(appConfig.name).web3,
                        appConfig.acc_pri_k,
                        appConfig.acc_address,
                        null,
                        gasEstimate,
                        appConfig.acc_address,
                        connect.get(appConfig.name).inst.address,
                        connect.get(appConfig.name).inst.sendTokens.changeOwner(
                          buyerAddr,
                          buyerLog,
                          sellerAddr,
                          sellerLog,
                          itemIndex
                        )
                      )
                        .then( receipt => {
                          jsonRes.success = true;
                          jsonRes.msg = 'Market item transacted successfully';
                        })
                        .catch( e => {
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
});

module.exports = router;
