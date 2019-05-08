/**
 * Manage user account(s)
 * @module app/controllers/user/account
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

module.exports = {

  /**
   * Add a new user
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  addUser: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.session.username != null) {
      jsonRes.msg = 'Logout first';
      res.json(jsonRes);
    } else if (req.body.s_username.length > 32) {
      jsonRes.msg = 'Username should be not more than 32 characters';
      res.json(jsonRes);
    } else {
      // Verify credentials
      contracts.get(userConfig.name).inst.verifyCredential(
        contracts.get(userConfig.name).web3.fromAscii(req.body.s_username),
        req.body.s_password,
        {gas: userConfig.DEFAULT_GAS},
        (err, result) => {
          if (result) {
            jsonRes.msg = 'User already exists';
            res.json(jsonRes);
          } else {
            const userAccAddr = web3Helper.getRandomAddress();

            if (userAccAddr) {
              let gasLimit;
              try {
                gasLimit = contracts
                  .get(userConfig.name)
                  .inst
                  .addUser
                  .estimateGas(
                    req.body.s_username,
                    userAccAddr,
                    req.body.s_password
                  );
              } catch (e) {
                gasLimit = userConfig.DEFAULT_GAS;
              }

              gasLimit = Math.round(gasLimit + gasLimit*0.5);
              gasLimit = `0x${gasLimit.toString(16)}`;

              web3Helper.sendRawTransaction(
                contracts.get(userConfig.name).web3,
                userConfig.acc_pri_k,
                userConfig.acc_address,
                null,
                gasLimit,
                userConfig.acc_address,
                contracts.get(userConfig.name).inst.address,
                contracts.get(userConfig.name).inst.addUser.getData(
                  contracts.get(userConfig.name).web3.fromAscii(req.body.s_username),
                  userAccAddr,
                  req.body.s_password
                )
              )
                .then(receipt => {
                  if (receipt.status != 0x1) {
                    throw new Error('Transaction failed');
                  }
                  jsonRes.success = true;
                  jsonRes.msg = 'User created successfully';
                })
                .catch(e => {
                  jsonRes.msg = 'User account creation failed';
                  res.status(500);
                })
                .finally(() => {
                  res.json(jsonRes);
                });
            } else {
              jsonRes.msg = 'User account creation failed';
              res.status(500).json(jsonRes);
            }
          }
        });
    }
  },

  /**
   * Update an existing user account
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  updateUser: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.session.username != null) {
      jsonRes.msg = 'Logout first';
      res.json(jsonRes);
    } else if (req.body.username.length > 32) {
      jsonRes.msg = 'Username should be not more than 32 characters';
      res.json(jsonRes);
    } else {
      let gasLimit = contracts
        .get(userConfig.name)
        .inst
        .updatePasswd
        .estimateGas(
          req.body.username,
          req.body.oldPassword,
          req.body.newPassword
        );

      gasLimit = Math.round(gasLimit + gasLimit*0.5);
      gasLimit = `0x${gasLimit.toString(16)}`;

      web3Helper.sendRawTransaction(
        contracts.get(userConfig.name).web3,
        userConfig.acc_pri_k,
        userConfig.acc_address,
        null,
        gasLimit,
        userConfig.acc_address,
        contracts.get(userConfig.name).inst.address,
        contracts.get(userConfig.name).inst.addUser.updatePasswd(
          req.body.username,
          req.body.oldPassword,
          req.body.newPassword
        )
      )
        .then(receipt => {
          if (receipt.status != 0x1) {
            throw new Error('Transaction failed');
          }
          jsonRes.success = true;
          jsonRes.msg = 'User updated successfully';
        })
        .catch(e => {
          jsonRes.msg = 'User updation failed';
          res.status(500);
        })
        .finally(() => {
          res.json(jsonRes);
        });
    }
  },

  /**
   * Delete an existing user account
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  deleteUser: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.session.username != null) {
      jsonRes.msg = 'Logout first';
      res.json(jsonRes);
    } else if (req.body.username.length > 32) {
      jsonRes.msg = 'Username should be not more than 32 characters';
      res.json(jsonRes);
    } else {
      let gasLimit = contracts
        .get(userConfig.name)
        .inst
        .removeUser
        .estimateGas(
          req.body.username,
          req.body.password
        );
      gasLimit = Math.round(gasLimit + gasLimit*0.5);
      gasLimit = `0x${gasLimit.toString(16)}`;

      web3Helper.sendRawTransaction(
        contracts.get(userConfig.name).web3,
        userConfig.acc_pri_k,
        userConfig.acc_address,
        null,
        gasLimit,
        userConfig.acc_address,
        contracts.get(userConfig.name).inst.address,
        contracts.get(userConfig.name).inst.addUser.removeUser(
          req.body.username,
          req.body.password
        )
      )
        .then(receipt => {
          if (receipt.status != 0x1) {
            throw new Error('Transaction failed');
          }
          jsonRes.success = true;
          jsonRes.msg = 'User deleted successfully';
        })
        .catch(e => {
          jsonRes.msg = 'User account deletion failed';
          res.status(500);
        })
        .finally(() => {
          res.json(jsonRes);
        });
    }
  },
};
