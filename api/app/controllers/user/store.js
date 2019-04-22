/**
 * User's item store
 * @module controllers/user/store
 * @requires local:web3-helper
 */
const path = require('path');

const web3Helper = require('web3-helper');

const connect = require(path.join(__dirname, '..', '..', '..', 'network', 'connect.js'));
const appConfig = require(path.join(__dirname, '..', '..', '..', 'config', 'contracts', 'deploy', 'app.js'));
// const userConfig = require(path.join(__dirname, '..', '..', '..', 'config', 'contracts', 'deploy', 'user.js'));
// const tknConfig = require(path.join(__dirname, '..', '..', '..', 'config', 'contracts', 'deploy', 'token.js'));

module.exports = {
  /**
   * Get user's store details
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  getUserStoreDetails: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.session.user_account != null) {
      // Get total item count in user store
      connect.get(appConfig.name).inst.getItemCount(
        (err1, result1) => {
          if (!err1) {
            const itemCount = parseInt(result1.toString());
            jsonRes.success = true;
            jsonRes.data = [];

            if (itemCount === 0) {
              res.json(jsonRes);
              return;
            }

            let callbackResolveIndex = 0;

            const callbackResolve = () => {
              callbackResolveIndex++;
              if (callbackResolveIndex == itemCount) {
                jsonRes.success = true;
                res.json(jsonRes);
              }
            };

            let itemListFlag = true;
            for (let index = 0; index < itemCount && itemListFlag; index++) {
              connect.get(appConfig.name).inst.getUserStoreItem(
                req.session.username,
                index,
                {from: appConfig.acc_address},
                (err2, result2) => {
                  if (!err2) {
                    jsonRes.data.push({
                      'sale': result2[0],
                      'index': index,
                      'name': result2[1],
                      'description': result2[2],
                      'price': result2[3].toString(),
                    });
                  } else {
                    if (index == 0) {
                      itemListFlag = false;
                    }
                  }
                  callbackResolve();
                });
            }
          } else {
            jsonRes.msg = 'Failed to retrieve a user item count';
            res.status(500).json(jsonRes);
          }
        });
    } else {
      jsonRes.msg = 'Unauthorised';
      res.status(401).json(jsonRes);
    }
  },

  /**
   * Add an item in the store
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  addItem: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.session.user_account != null) {
      let gasEstimate = connect.get(appConfig.name).inst.createItem.estimateGas(
        req.body.productName,
        req.body.productDesc,
        req.body.productPrice,
        req.session.user_account
      );
      gasEstimate = Math.round(gasEstimate + gasEstimate*0.4);
      gasEstimate = appConfig.DEFAULT_GAS*3;

      web3Helper.sendRawTransaction(
        connect.get(appConfig.name).web3,
        appConfig.acc_pri_k,
        appConfig.acc_address,
        null,
        gasEstimate,
        appConfig.acc_address,
        connect.get(appConfig.name).inst.address,
        connect.get(appConfig.name).inst.createItem.getData(
          req.body.productName,
          req.body.productDesc,
          req.body.productPrice,
          req.session.user_account
        )
      )
        .then(receipt => {
          jsonRes.success = true;
          jsonRes.msg = 'Added item successfully';
        })
        .catch(e => {
          jsonRes.msg = 'Unable to add item';
          res.status(500);
        })
        .finally(() => {
          res.json(jsonRes);
        });
    } else {
      jsonRes.msg = 'Unauthorised';
      res.status(401).json(jsonRes);
    }
  },

  /**
   * Add an item in the store
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  updateItem: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.session.username != null) {
      if (
        req.body == null ||
        Object.keys(req.body).length === 0 ||
        req.body.productIndex != null ||
        !isNaN(req.body.productIndex)
      ) {
        // Default arguments
        if (req.body.productSale == null) req.body.productSale = false;
        if (req.body.productName == null) req.body.productName = '';
        if (req.body.productDesc == null) req.body.productDesc = '';
        if (req.body.productPrice == null || isNaN(req.body.productPrice)) req.body.productPrice = -1;

        // Estimate gas limit
        let gasEstimate;
        try {
          gasEstimate = connect.get(appConfig.name).inst.updateItem.estimateGas(
            req.body.productName,
            req.body.productDesc,
            req.body.productPrice,
            req.body.productSale,
            req.body.productIndex,
            req.session.username,
            req.session.password
          );
          gasEstimate = Math.round(gasEstimate + gasEstimate*0.1);
        } catch (e) {
          gasEstimate = appConfig.DEFAULT_GAS;
        }

        web3Helper.sendRawTransaction(
          connect.get(appConfig.name).web3,
          appConfig.acc_pri_k,
          appConfig.acc_address,
          null,
          gasEstimate,
          appConfig.acc_address,
          connect.get(appConfig.name).inst.address,
          connect.get(appConfig.name).inst.updateItem.getData(
            req.body.productName,
            req.body.productDesc,
            req.body.productPrice,
            req.body.productSale,
            req.body.productIndex,
            req.session.username,
            req.session.password
          )
        )
          .then(receipt => {
            jsonRes.success = true;
            jsonRes.msg = 'Updated item successfully';
          })
          .catch(e => {
            jsonRes.msg = 'Unable to update item';
            res.status(500);
          })
          .finally( () => {
            res.json(jsonRes);
          });
      } else {
        jsonRes.msg = 'Insufficient arguments';
        res.status(400).json(jsonRes);
      }
    } else {
      jsonRes.msg = 'Unauthorised';
      res.status(401).json(jsonRes);
    }
  },

  /**
   * Add an item in the store
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  deleteItem: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.session.username != null) {
      let gasEstimate = connect.get(appConfig.name).inst.deleteItem.estimateGas(
        req.body.productIndex);
      gasEstimate = Math.round(gasEstimate + gasEstimate*0.4);

      web3Helper.sendRawTransaction(
        connect.get(appConfig.name).web3,
        appConfig.acc_pri_k,
        appConfig.acc_address,
        null,
        gasEstimate,
        appConfig.acc_address,
        connect.get(appConfig.name).inst.address,
        connect.get(appConfig.name).inst.deleteItem.getData(
          req.body.productIndex
        )
      )
        .then(receipt => {
          jsonRes.success = true;
          jsonRes.msg = 'Deleted item successfully';
        })
        .catch(e => {
          jsonRes.msg = 'Deletion failed';
          res.status(500);
        })
        .finally( () => {
          res.json(jsonRes);
        });
    } else {
      jsonRes.msg = 'Unauthorised';
      res.status(401).json(jsonRes);
    }
  },
};
