/**
 * Load deployed contracts
 * @module network/loader
 * @requires web3
 * @requires fs
 * @requires path
 */
const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

const contracts = require('../contracts/instance');

// Configuration files
const appConfig = require('../config/contracts/deploy/app');
const userConfig = require('../config/contracts/deploy/user');
const tknConfig = require('../config/contracts/deploy/token');

// Info files to load contracts from
const appInfoFilePath = path.join(
  __dirname, '..', 'config', 'contracts', 'load', 'app.json'
);
const userInfoFilePath = path.join(
  __dirname, '..', 'config', 'contracts', 'load', 'user.json'
);
const tknInfoFilePath = path.join(
  __dirname, '..', 'config', 'contracts', 'load', 'token.json'
);

/**
 * Connect to existing deployed User contract
 * @return {Object} Promisified function
 */
function loadUser() {
  return new Promise((resolve, request) => {
    const web3 = new Web3(new Web3.providers.HttpProvider(userConfig.provider));
    if (web3.isConnected()) {
      const contInfo = JSON.parse(fs.readFileSync(userInfoFilePath, 'utf8'));
      contracts.add(
        userConfig.name,
        web3,
        web3.eth.contract(contInfo.c_abi).at(contInfo.c_address)
      );
      resolve();
    } else {
      reject(new Error('Not connected to App blockchain'));
    }
  });
}

/**
 * Connect to existing deployed App contract
 * @return {Object} Promisified function
 */
function loadApp() {
  return new Promise((resolve, request) => {
    const web3 = new Web3(new Web3.providers.HttpProvider(appConfig.provider));
    if (web3.isConnected()) {
      const contInfo = JSON.parse(fs.readFileSync(appInfoFilePath, 'utf8'));
      contracts.add(
        appConfig.name,
        web3,
        web3.eth.contract(contInfo.c_abi).at(contInfo.c_address)
      );
      resolve();
    } else {
      reject(new Error('Not connected to App blockchain'));
    }
  });
}

/**
 * Connect to existing deployed token contract
 * @return {Object} Promisified function
 */
function loadToken() {
  return new Promise((resolve, reject) => {
    const web3 = new Web3(new Web3.providers.HttpProvider(tknConfig.provider));
    if (web3.isConnected()) {
      web3.eth.defaultAccount = tknConfig.acc_address;
      const contInfo = JSON.parse(fs.readFileSync(tknInfoFilePath, 'utf8'));
      contracts.add(
        tknConfig.name,
        web3,
        web3.eth.contract(contInfo.c_abi).at(contInfo.c_address),
        contInfo.c_address
      );
      resolve();
    } else {
      reject(new Error('Not connected to Token blockchain'));
    }
  });
}

/**
 * Load all contracts
 * @return {Object} Promisified function
 */
function load() {
  return new Promise((resolve, reject) => {
    Promise.all([loadUser(), loadApp(), loadToken()])
      .then(() => {
        resolve();
      })
      .catch(err => {
        reject(err);
      });
  });
}

module.exports = {
  load: load,
  loadApp: loadApp,
  loadToken: loadToken,
};
