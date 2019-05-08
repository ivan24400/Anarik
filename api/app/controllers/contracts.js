/**
 * Contract(s) deployment and loading
 * @module app/controllers/contracts
 * @requires path
 */

const path = require('path');

const appConfig = require(path.join(
  __dirname, '..', '..', 'config', 'contracts', 'deploy', 'app.js'
));
const tknConfig = require(path.join(
  __dirname, '..', '..', 'config', 'contracts', 'deploy', 'token.js'
));

const contracts = require(path.join(
  __dirname, '..', '..', 'contracts', 'instance.js'
));
const loader = require(path.join(
  __dirname, '..', '..', 'network', 'loader.js'
));
const deploy = require(path.join(
  __dirname, '..', '..', 'network', 'deploy.js'
));

module.exports = {

  /**
   * Deploy all contracts
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  deploy: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    deploy.deploy()
      .then(() => {
        jsonRes.success = true;
        jsonRes.msg = 'Contracts deployed successfully';
      })
      .catch(e => {
        res.status(500);
        jsonRes.msg = e.message;
      })
      .finally(() => {
        res.json(jsonRes);
      });
  },

  /**
   * Load all contracts which are already deployed
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  load: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;
    jsonRes.msg = 'NA';

    loader.load()
      .then(() => {
        jsonRes.success = true;
        jsonRes.msg = 'Contracts loaded successfully';
      })
      .catch(result => {
        res.status(500);
        jsonRes.msg = result;
      })
      .finally(() =>{
        res.json(jsonRes);
      });
  },

  /**
   * Get account balances from all blockchains
   * @param {Object} req - http request object
   * @param {Object} res - http response object
   */
  getBalances: (req, res) => {
    const jsonRes = {};
    jsonRes.success = false;

    jsonRes.balance = {};
    try {
      jsonRes.balance.app = contracts
        .get(appConfig.name)
        .web3
        .eth
        .getBalance(appConfig.acc_address)
        .toString();
      jsonRes.balance.tkn = contracts
        .get(tknConfig.name)
        .web3
        .eth
        .getBalance(tknConfig.acc_address)
        .toString();
    } catch (e) {
      jsonRes.msg = 'Unable to get balance';
    }

    if (Object.values(jsonRes.balance).length > 0) {
      jsonRes.success = true;
    }
    res.json(jsonRes);
  },
};
