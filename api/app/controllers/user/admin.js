
/**
 * Manage user account(s)
 * @module app/controllers/user/admin
 * @requires local:web3-helper
 * @requires path
 */
const path = require('path');

const web3Helper = require('web3-helper');

const contracts = require(path.join(
  __dirname, '..', '..', '..', 'contracts', 'instance.js'
));
const tknConfig = require(path.join(
  __dirname, '..', '..', '..', 'config', 'contracts', 'deploy', 'token.js'
));
const userConfig = require(path.join(
  __dirname, '..', '..', '..', 'config', 'contracts', 'deploy', 'user.js'
));

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
      req.body.tokenRecvr != null &&
          req.body.tokenCount != null &&
          req.body.tokenCount > 0
    ) {
      // Verify for admin's credentials
      contracts.get(userConfig.name).inst.verifyAdminCredential(
        req.session.username,
        req.session.password,
        (err, result) => {
          if (!err || result) {
            contracts.get(userConfig.name).inst.getUserAccAddr(
              req.body.tokenRecvr,
              {from: userConfig.acc_address},
              (err1, result1) => {
                if (!err1) {
                  let gasLimit;
                  try {
                    gasLimit = contracts
                      .get(tknConfig.name)
                      .inst
                      .donateTokens
                      .estimateGas(
                        req.session.user_account,
                        result1,
                        req.body.tokenCount,
                        {from: tknConfig.acc_address}
                      );
                    gasLimit = Math.round(gasLimit + gasLimit*0.6);
                  } catch (e) {
                    gasLimit = contracts.get(tknConfig.name).gas;
                  }

                  web3Helper.sendRawTransaction(
                    contracts.get(tknConfig.name).web3,
                    tknConfig.acc_pri_k,
                    tknConfig.acc_address,
                    null,
                    gasLimit,
                    tknConfig.acc_address,
                    contracts.get(tknConfig.name).inst.address,
                    contracts.get(tknConfig.name).inst.donateTokens.getData(
                      req.session.user_account,
                      result1,
                      req.body.tokenCount
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

    if (req.body.tokenRequestIndex != null) {
      // Verify admin's credential
      contracts.get(userConfig.name).inst.verifyAdminCredential(
        req.session.username,
        req.session.password,
        (err, result) => {
          if (!err || result) {
            // Acknowledge token request
            let gasLimit = parseInt(
              contracts
                .get(tknConfig.name)
                .inst
                .ackRequestAt
                .estimateGas(
                  req.body.tokenRequestIndex,
                  req.session.user_account,
                  {from: tknConfig.acc_address}
                ));

            gasLimit = Math.round(gasLimit + gasLimit*0.3);

            web3Helper.sendRawTransaction(
              contracts.get(tknConfig.name).web3,
              tknConfig.acc_pri_k,
              tknConfig.acc_address,
              null,
              gasLimit,
              tknConfig.acc_address,
              contracts.get(tknConfig.name).inst.address,
              contracts
                .get(tknConfig.name)
                .inst
                .ackRequestAt
                .getData(req.body.tokenRequestIndex, req.session.user_account)
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
      jsonRes.msg = 'Invalid token request';
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

    if (req.body.tokenRequestIndex != null) {
      // Verify admin's credential
      contracts.get(userConfig.name).inst.verifyAdminCredential(
        req.session.username,
        req.session.password,
        (err, result) => {
          if (!err || result) {
            let gasLimit = parseInt(
              contracts.get(tknConfig.name).inst.rejectRequestAt.estimateGas(
                req.body.tokenRequestIndex,
                {from: tknConfig.acc_address}
              ));

            gasLimit = Math.round(gasLimit + gasLimit*0.3);

            web3Helper.sendRawTransaction(
              contracts.get(tknConfig.name).web3,
              tknConfig.acc_pri_k,
              tknConfig.acc_address,
              null,
              gasLimit,
              tknConfig.acc_address,
              contracts.get(tknConfig.name).inst.address,
              contracts
                .get(tknConfig.name)
                .inst
                .rejectRequestAt
                .getData(req.body.tokenRequestIndex)
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
