/**
 * Manage user account(s)
 * @module app/controllers/user/account
 * @requires local:web3-helper
 * @requires path
 */
const path = require('path');

const web3Helper = require('web3-helper');

const contracts = require(path.join(__dirname, '..', '..', '..', 'contracts', 'instance.js'));
const userConfig = require(path.join(__dirname, '..', '..', '..', 'config', 'contracts', 'deploy', 'user.js'));

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
      try {
        // Verify credentials
        contracts.get(userConfig.name).inst.verifyCredential(
          contracts.get(userConfig.name).web3.fromAscii(req.body.s_username),
          req.body.s_password,
          {gas: userConfig.DEFAULT_GAS},
          (err, result) => {
            if (!err || result) {
              jsonRes.msg = 'User already exists';
              res.json(jsonRes);
            } else {
              const userAccAddr = web3Helper.getRandomAddress();

              if (userAccAddr) {
                let gasEstimate;
                try {
                  gasEstimate = contracts.get(userConfig.name).inst.addUser.estimateGas(
                    req.body.s_username,
                    userAccAddr,
                    req.body.s_password
                  );
                } catch (e) {
                  gasEstimate = userConfig.DEFAULT_GAS;
                }

                gasEstimate = '0x' + Math.round(gasEstimate + gasEstimate*0.5).toString(16);

                web3Helper.sendRawTransaction(
                  contracts.get(userConfig.name).web3,
                  userConfig.acc_pri_k,
                  userConfig.acc_address,
                  null,
                  gasEstimate,
                  userConfig.acc_address,
                  contracts.get(userConfig.name).inst.address,
                  contracts.get(userConfig.name).inst.addUser.getData(
                    req.body.s_username,
                    userAccAddr,
                    req.body.s_password
                  )
                )
                  .then(receipt => {
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
      } catch (e) {
        jsonRes.msg = 'Operation failed';
        res.json(jsonRes);
      }
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
      try {
        let gasEstimate = contracts.get(userConfig.name).inst.updatePasswd.estimateGas(
          req.body.username,
          req.body.oldPassword,
          req.body.newPassword
        );
  
        gasEstimate = Math.round(gasEstimate + gasEstimate*0.5);
  
        web3Helper.sendRawTransaction(
          contracts.get(userConfig.name).web3,
          userConfig.acc_pri_k,
          userConfig.acc_address,
          null,
          gasEstimate,
          userConfig.acc_address,
          contracts.get(userConfig.name).inst.address,
          contracts.get(userConfig.name).inst.addUser.updatePasswd(
            req.body.username,
            req.body.oldPassword,
            req.body.newPassword
          )
        )
          .then(receipt => {
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
      } catch (e) {
        jsonRes.msg = 'Operation failed';
        res.json(jsonRes);
      }
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
      try {
        let gasEstimate = contracts.get(userConfig.name).inst.removeUser.estimateGas(
          req.body.username,
          req.body.password
        );
        gasEstimate = Math.round(gasEstimate + gasEstimate*0.5);
        web3Helper.sendRawTransaction(
          contracts.get(userConfig.name).web3,
          userConfig.acc_pri_k,
          userConfig.acc_address,
          null,
          gasEstimate,
          userConfig.acc_address,
          contracts.get(userConfig.name).inst.address,
          contracts.get(userConfig.name).inst.addUser.removeUser(
            req.body.username,
            req.body.password
          )
        )
          .then(receipt => {
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
      } catch (e) {
        jsonRes.msg = 'Operation failed';
        res.json(jsonRes);
      }
    }
  },
};
