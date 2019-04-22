const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

const web3Helper = require('web3-helper');

const connect = require(path.join(__dirname, 'connect.js'));
// const loader = require(path.join(__dirname, 'loader.js'));
const compiler = require(path.join(__dirname, '..', 'contracts', 'compiler.js'));

const appConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'app.js'));
const userConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'user.js'));
const tknConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'token.js'));


const appInfoFilePath = path.join(__dirname, '..', 'config', 'contracts', 'load', 'app.json');
const userInfoFilePath = path.join(__dirname, '..', 'config', 'contracts', 'load', 'user.json');
const tokenInfoFilePath = path.join(__dirname, '..', 'config', 'contracts', 'load', 'token.json');

let adminAddress;
/**
 * Contract deployment template
 * @param {Object} web3 web3 instance of the blockchain
 * @param {string} contName contract name
 * @param {Array} contArgs contract constructor arguments
 * @param {Object} bytecode contract bytecode
 * @param {number} gas gas limit
 * @param {Object} abi contract abi
 * @param {string} fromAddr user account address which will deploy the contract
 * @param {string} privateKey private key of transaction sender
 * @param {string} infoFilePath file path to store abi and byte code.
 * @return {Object} a promise
 */
function deployRt(
  web3,
  contName,
  contArgs,
  bytecode,
  gas,
  abi,
  fromAddr,
  privateKey,
  infoFilePath
) {
  return new Promise((_resolve, _reject) => {
    console.log('Deploying '+contName+' contracts =========='+fromAddr);

    if (bytecode.slice(0, 2) !== '0x') bytecode = '0x' + bytecode;

    let gasEstimate;
    try {
      gasEstimate = ( (isNaN(gas) || gas == null) ?
        web3.eth.estimateGas({data: bytecode}) :
        gas
      );
    } catch (e) {
      gasEstimate = compiler.defaultGasLimit;
    }
    gasEstimate = Math.round(parseInt(gasEstimate) + parseInt(gasEstimate)*0.1);

    console.log('Gas estimate:'+gasEstimate);
    console.log('Block gas limit:'+web3.eth.getBlock('latest').gasLimit);
    console.log('Funds:'+web3.eth.getBalance(fromAddr));

    const _cont = web3.eth.contract(JSON.parse(JSON.stringify(abi)));

    web3Helper.sendRawTransaction(
      web3,
      privateKey,
      fromAddr,
      null,
      gasEstimate,
      fromAddr,
      null,
      (
        contArgs == null ?
          _cont.new.getData({data: bytecode}) :
          _cont.new.getData(...contArgs, {data: bytecode})
      )
    ).then( receipt => {
      const contAddr = receipt.contractAddress;
      const contInst = _cont.at(contAddr);
      console.log('Deployed '+contName+' at:'+contAddr);
      if (contAddr == null) {
        return;
      }

      const infoFileContent = {
        c_address: contAddr,
        c_abi: abi,
      };

      fs.writeFile(
        infoFilePath,
        JSON.stringify(infoFileContent),
        err => {
          if (err) {
            return console.log(err);
          }
        });
      connect.add(contName, web3, contInst);
      _resolve(contAddr);
    }).catch( err => {
      _reject(err);
    });
  });
}

/**
 * Deploy App contracts on blockchain
 * @return {Object} A promise object
 */
function deployApp() {
  return new Promise(async (resolve, reject) => {
    const web3App = new Web3(new Web3.providers.HttpProvider(appConfig.provider));
    if (web3App.isConnected()) {
      web3App.eth.defaultAccount = appConfig.acc_address;

      const contCompiled = compiler.compileApp();
      const userCompiled = compiler.compileUser();
      if (contCompiled) {
        try {
          adminAddress = web3Helper.getRandomAddress();
          console.log(`Admin account address ${adminAddress}`);
          // Deploy user contract
          const userContAddr = await deployRt(
            web3App,
            userConfig.name,
            [userConfig.adminName, userConfig.adminPasswd, web3Helper.getRandomAddress()],
            userCompiled.User.User.evm.bytecode.object,
            userCompiled.User.User.evm.gasEstimates.creation.totalCost,
            userCompiled.User.User.abi,
            userConfig.acc_address,
            userConfig.acc_pri_k,
            userInfoFilePath
          );
          // Deploy Anarik contract
          await deployRt(
            web3App,
            appConfig.name,
            [userContAddr], // [userConfig.adminName, userConfig.adminPasswd, web3Helper.getRandomAddress()],
            contCompiled.Anarik.Anarik.evm.bytecode.object,
            contCompiled.Anarik.Anarik.evm.gasEstimates.creation.totalCost,
            contCompiled.Anarik.Anarik.abi,
            appConfig.acc_address,
            appConfig.acc_pri_k,
            appInfoFilePath
          );

          resolve();
        } catch (e) {
          console.log(e);
          reject('App deployment failed');
        }
      } else {
        reject('App compilation failed');
      }
    } else {
      reject('App not connected to blockchain');
    }
  });
}

/**
 * Deploy token contracts on blockchain
 * @param {number} totalTokens total number of tokens in the app
 * @return {Object} A promise object
 */
function deployToken(totalTokens) {
  return new Promise(async (resolve, reject) => {
    const web3Tkn = new Web3(new Web3.providers.HttpProvider(tknConfig.provider));
    if (web3Tkn.isConnected()) {
      web3Tkn.eth.defaultAccount = tknConfig.acc_address;
      const contCompiled = compiler.compileToken();

      if (contCompiled) {
        try {
          await deployRt(
            web3Tkn,
            tknConfig.name,
            [(totalTokens == null ? tknConfig.TOTAL_TOKENS : totalTokens), adminAddress],
            contCompiled.Snail.Snail.evm.bytecode.object,
            contCompiled.Snail.Snail.evm.gasEstimates.creation.totalCost,
            contCompiled.Snail.Snail.abi,
            tknConfig.acc_address,
            tknConfig.acc_pri_k,
            tokenInfoFilePath
          );
          resolve();
        } catch (e) {
          reject('Token deployment failed');
        }
      } else {
        reject('Token compilation failed');
      }
    } else {
      reject('Token not connected to blockchain');
    }
  });
}

/**
 * Deploy all contracts  to the blockchain
 * @return {Object} A promise object
 */
function deploy() {
  return new Promise((resolve, reject) => {
    (async () =>{
      try {
        await deployApp();
        await deployToken();
        resolve();
      } catch (e) {
        reject(e);
      }
    })();
  });
}

module.exports = {
  deploy: deploy,
  deployApp: deployApp,
  deployToken: deployToken,
};
