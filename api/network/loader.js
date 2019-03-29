const fs = require('fs');
const path = require('path');
const Web3 = require('web3');

let connect = require(path.join(__dirname,'connect.js'));

let appConfig = require(path.join(__dirname,'config', 'app.js'));
let tknConfig = require(path.join(__dirname,'config', 'token.js'));
const appInfoFilePath = path.join(__dirname,'info','app.js');
const tknInfoFilePath = path.join(__dirname, 'info', 'token.js');

let contracts = null;

/* Initialize loader */
function reset(){
  contracts = new Object();
}

/**
 * Add named instance in the list
 * @param name name of the instance
 * @param instance instance of deployed contract
 */
function addInstance(name, instance){
  contracts[name] = instance;
}

function getContracts(){
  return contracts;
}

/* Connect to existing deployed App contract */
function loadApp(){
  if(contracts == null) reset();

  return new Promise(function(resolve,request){
    let web3 = new Web3(new Web3.providers.HttpProvider(appConfig.provider));
    if(web3.isConnected()){
      web3.eth.defaultAccount = appConfig.acc_address;
      let contInfo = JSON.parse(fs.readFileSync(appInfoFilePath, 'utf8'));
      connect.add(
        appConfig.name,
        web3,
        web3.eth.contract(contInfo.c_abi).at(contInfo.c_address),
        contInfo.c_address,
      );
      resolve();
    }else{
      reject('Not connected to App blockchain');
    }
  });
}

/* Connect to existing deployed token contract */
function loadToken(){
  if(contracts == null) reset();

  return new Promise(function(resolve,reject){
    let web3 = new Web3(new Web3.providers.HttpProvider(tknConfig.provider));
    if(web3.isConnected()){
      web3.eth.defaultAccount = tknConfig.acc_address;
      let contInfo = JSON.parse(fs.readFileSync(tknInfoFilePath, 'utf8'));
      connect.add(
        tknConfig.name,
        web3,
        web3.eth.contract(contInfo.c_abi).at(contInfo.c_address),
        contInfo.c_address
      );
      resolve();
    }else{
      reject('Not connected to Token blockchain');
    }
  });

}

/* Load all contracts */
function load(){
  return new Promise(function(resolve, reject){
    Promise.all([loadApp(), loadToken()])
    .then(function(){
      resolve();
    })
    .catch(function(err){
      reject(err)
    });
  });
}

module.exports = {
  load: load,
  loadApp: loadApp,
  loadToken: loadToken
}
