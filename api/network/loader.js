const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

const connect = require(path.join(__dirname, 'connect.js'));

const appConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'app.js'));
const userConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'user.js'));
const tknConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'token.js'));

const appInfoFilePath = path.join(__dirname, '..', 'config', 'contracts', 'load', 'app.json');
const userInfoFilePath = path.join(__dirname, '..', 'config', 'contracts', 'load', 'user.json');
const tknInfoFilePath = path.join(__dirname, '..', 'config', 'contracts', 'load', 'token.json');

let contracts = null;

/** Initialize loader */
function reset() {
  contracts = {};
}

/**
 * Connect to existing deployed User contract
 * @return {Object} Promisified function
 */
function loadUser() {
  if (contracts == null) reset();

  return new Promise((resolve, request) => {
    const web3 = new Web3(new Web3.providers.HttpProvider(userConfig.provider));
    if (web3.isConnected()) {
      const contInfo = JSON.parse(fs.readFileSync(userInfoFilePath, 'utf8'));
      connect.add(
        userConfig.name,
        web3,
        web3.eth.contract(contInfo.c_abi).at(contInfo.c_address)
      );
      resolve();
    } else {
      reject('Not connected to App blockchain');
    }
  });
}

/**
 * Connect to existing deployed App contract
 * @return {Object} Promisified function
 */
function loadApp() {
  if (contracts == null) reset();

  return new Promise((resolve, request) => {
    const web3 = new Web3(new Web3.providers.HttpProvider(appConfig.provider));
    if (web3.isConnected()) {
      const contInfo = JSON.parse(fs.readFileSync(appInfoFilePath, 'utf8'));
      connect.add(
        appConfig.name,
        web3,
        web3.eth.contract(contInfo.c_abi).at(contInfo.c_address)
      );
      resolve();
    } else {
      reject('Not connected to App blockchain');
    }
  });
}

/**
 * Connect to existing deployed token contract
 * @return {Object} Promisified function
 */
function loadToken() {
  if (contracts == null) reset();

  return new Promise((resolve, reject) => {
    const web3 = new Web3(new Web3.providers.HttpProvider(tknConfig.provider));
    if (web3.isConnected()) {
      web3.eth.defaultAccount = tknConfig.acc_address;
      const contInfo = JSON.parse(fs.readFileSync(tknInfoFilePath, 'utf8'));
      connect.add(
        tknConfig.name,
        web3,
        web3.eth.contract(contInfo.c_abi).at(contInfo.c_address),
        contInfo.c_address
      );
      resolve();
    } else {
      reject('Not connected to Token blockchain');
    }
  });
}

/**
 * Load all contracts
 * @return {Object} Promisified function
 */
function load() {
  return new Promise((resolve, reject) => {
    Promise.all([loadToken(), loadApp()])
      .then(function() {
        resolve();
      })
      .catch(function(err) {
        reject(err);
      });
  });
}

module.exports = {
  load: load,
  loadApp: loadApp,
  loadToken: loadToken,
};
