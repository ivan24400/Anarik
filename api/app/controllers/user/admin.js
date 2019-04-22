
/**
 * Manage user account(s)
 * @module controllers/user/admin
 * @requires local:web3-helper
 */
const path = require('path');

const web3Helper = require('web3-helper');

const connect = require(path.join(__dirname, '..', '..', '..', 'network', 'connect.js'));
const tknConfig = require(path.join(__dirname, '..', '..', '..', 'config', 'contracts', 'deploy', 'token.js'));
const userConfig = require(path.join(__dirname, '..', '..', '..', 'config', 'contracts', 'deploy', 'user.js'));

module.exports = {

  /**
   * Send tokens to a user
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  sendTokens: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';
    if (
      req.body.token_recvr != null &&
          req.body.token_count != null &&
          req.body.token_count > 0
    ) {
      connect.get(userConfig.name).inst.verifyAdminCredential(
        req.session.username,
        req.session.password,
        (err, result) => {
          if (!err || result) {
            connect.get(userConfig.name).inst.getUserAccAddr(
              req.body.token_recvr,
              {from: userConfig.acc_address},
              (err1, result1) => {
                if (!err1) {
                  let gasLimit;
                  try {
                    gasLimit = connect.get(tknConfig.name).inst.donateTokens.estimateGas(
                      req.session.user_account,
                      result1,
                      req.body.token_count,
                      {from: tknConfig.acc_address}
                    );
                    gasLimit = Math.round(gasLimit + gasLimit*0.6);
                  } catch (e) {
                    gasLimit = connect.get(tknConfig.name).gas;
                  }

                  web3Helper.sendRawTransaction(
                    connect.get(tknConfig.name).web3,
                    tknConfig.acc_pri_k,
                    tknConfig.acc_address,
                    null,
                    gasLimit,
                    tknConfig.acc_address,
                    connect.get(tknConfig.name).inst.address,
                    connect.get(tknConfig.name).inst.donateTokens.getData(
                      req.session.user_account,
                      result1,
                      req.body.token_count
                    )
                  )
                    .then(receipt => {
                      jsonRes.success = true;
                      jsonRes.msg = 'Token transferred successfully';
                      res.json(jsonRes);
                    })
                    .catch(error => {
                      jsonRes.msg = 'Token transfer failed';
                      res.status(500).json(jsonRes);
                    });
                } else {
                  jsonRes.msg = 'Unable to retrieve user\'s account';
                  res.status(500).json(jsonRes);
                }
              });
          } else {
            jsonRes.msg = 'Unauthorised';
            res.status(401).json(jsonRes);
          }
        });
    } else {
      jsonRes.msg = 'Unauthorised';
      res.status(401).json(jsonRes);
    }
  },

  /**
   * Acknowledge token request of a user
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  acknowledgeRequest: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.body.token_requestor_index != null) {
      connect.get(userConfig.name).inst.verifyAdminCredential(
        req.session.username,
        req.session.password,
        (err, result) => {
          if (!err || result) {
            // Acknowledge token request
            let gasLimit = parseInt(connect.get(tknConfig.name).inst.ackRequestAt.estimateGas(
              req.body.token_requestor_index,
              {from: tknConfig.acc_address}
            ));

            gasLimit = Math.round(gasLimit + gasLimit*0.3);

            web3Helper.sendRawTransaction(
              connect.get(tknConfig.name).web3,
              tknConfig.acc_pri_k,
              tknConfig.acc_address,
              null,
              gasLimit,
              tknConfig.acc_address,
              connect.get(tknConfig.name).inst.address,
              connect.get(tknConfig.name).inst.ackRequestAt.getData(req.body.token_requestor_index)
            )
              .then(receipt => {
                jsonRes.success = true;
                jsonRes.msg = 'Token request acknowledged successfully';
                res.json(jsonRes);
              })
              .catch(error => {
                jsonRes.msg = 'Request acknowledgement failed';
                res.status(400).json(jsonRes);
              });
          }
        });
    } else {
      jsonRes.msg = 'Unauthorised';
      res.status(401).json(jsonRes);
    }
  },

  /**
   * Reject a token request of a user
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  rejectRequest: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    if (req.body.token_requestor_index != null) {
      connect.get(userConfig.name).inst.verifyAdminCredential(
        req.session.username,
        req.session.password,
        (err, result) => {
          if (!err || result) {
            let gasLimit = parseInt(connect.get(tknConfig.name).inst.rejectRequestAt.estimateGas(
              req.body.token_requestor_index,
              {from: tknConfig.acc_address}
            ));

            gasLimit = Math.round(gasLimit + gasLimit*0.3);

            web3Helper.sendRawTransaction(
              connect.get(tknConfig.name).web3,
              tknConfig.acc_pri_k,
              tknConfig.acc_address,
              null,
              gasLimit,
              tknConfig.acc_address,
              connect.get(tknConfig.name).inst.address,
              connect.get(tknConfig.name).inst.rejectRequestAt.getData(req.body.token_requestor_index)
            )
              .then(receipt => {
                jsonRes.success = true;
                jsonRes.message = 'Token request rejected successfully';
                res.json(jsonRes);
              })
              .catch(error => {
                jsonRes.message = 'Request rejection failed';
                res.status(400).json(jsonRes);
              });
          }
        });
    } else {
      jsonRes.message = 'Unauthorised';
      res.status(401).json(jsonRes);
    }
  },
};
