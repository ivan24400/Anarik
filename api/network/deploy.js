const Web3 = require('web3');
let Tx = require('ethereumjs-tx');
let fs = require('fs');
let path = require('path');

let web3_helper = require('web3-helper');

let connect = require(path.join(__dirname,'connect.js'));
let loader = require(path.join(__dirname,'loader.js'));
let compiler = require(path.join(__dirname,'compiler.js'));

const appConfig = require(path.join(__dirname,'config','app.js'));
const userConfig = require(path.join(__dirname,'config','user.js'));
const tknConfig = require(path.join(__dirname,'config','token.js'));

const appInfoFilePath = path.join(__dirname,'info','app.js');
const userInfoFilePath = path.join(__dirname, 'info', 'user.js');
const tokenInfoFilePath = path.join(__dirname,'info','token.js');

const TOTAL_TOKENS = 2400000;

/**
 * Contract deployment template
 * @param web3 web3 instance of the blockchain
 * @param contName contract name
 * @param bytecode contract bytecode
 * @param gas gas limit
 * @param abi contract abi
 * @param fromAddr user account address which will deploy the contract
 * @param infoFilePath file path to store abi and byte code.
 * @return true/false depending on operation execution.
 */
function deployRt(web3, contName, contArgs, bytecode, gas, abi, fromAddr, private_key, infoFilePath){
  return new Promise((_resolve, _reject) => {
    console.log('Deploying '+contName+' contracts =========='+fromAddr);

    if(bytecode.slice(0,2) !== '0x') bytecode = '0x' + bytecode;

    let gasEstimate;
    try{
      gasEstimate = ( (isNaN(gas) || gas == null) ? web3.eth.estimateGas({data: bytecode}) : gas);
    }catch(e){
      gasEstimate = compiler.defaultGasLimit;
    }
    gasEstimate = Math.round(parseInt(gasEstimate) + gasEstimate*0.1);

    console.log("Gas estimate:"+gasEstimate);
    console.log('Block gas limit:'+web3.eth.getBlock("latest").gasLimit)
    console.log('Funds:'+web3.eth.getBalance(fromAddr));

    const _cont = web3.eth.contract(JSON.parse(JSON.stringify(abi)));

      web3_helper.sendRawTransaction(
        web3,
        private_key,
        fromAddr,
        null,
        gasEstimate,
        fromAddr,
        null,
        (contArgs == null ? _cont.new.getData({data: bytecode}) : _cont.new.getData(...contArgs, {data: bytecode}))
      ).then( receipt => {
        const contAddr = receipt.contractAddress;
        const contInst = _cont.at(contAddr);
        console.log('Deployed '+contName+' at:'+contAddr);
        if(contAddr == null){
          return;
        }

        const infoFileContent = {
            c_address: contAddr,
            c_abi: abi
          };

        fs.writeFile(infoFilePath, JSON.stringify(infoFileContent), function(err) {
            if(err) {
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

/* Deploy App contracts on blockchain */
function deployApp(){

  return new Promise(async (resolve, reject) => {
    const web3_app = new Web3(new Web3.providers.HttpProvider(appConfig.provider));
    if(web3_app.isConnected()){

      web3_app.eth.defaultAccount = appConfig.acc_address;

      const contCompiled = compiler.compileApp();
      const userCompiled = compiler.compileUser();
      if(contCompiled){
        try{
              const adminAddr = web3_helper.getRandomAddress();
              console.log(`Admin account address ${adminAddr}`);
              // Deploy user contract
              const userContAddr = await deployRt(
                web3_app,
                userConfig.name,
                [connect._admin, connect._admin_pass, web3_helper.getRandomAddress()],
                userCompiled.User.User.evm.bytecode.object,
                userCompiled.User.User.evm.gasEstimates.creation.totalCost,
                userCompiled.User.User.abi,
                userConfig.acc_address,
                userConfig.acc_pri_k,
                userInfoFilePath
              );
              // Deploy Anarik contract
              await deployRt(
                web3_app,
                appConfig.name,
                [userContAddr],
                contCompiled.Anarik.Anarik.evm.bytecode.object,
                contCompiled.Anarik.Anarik.evm.gasEstimates.creation.totalCost,
                contCompiled.Anarik.Anarik.abi,
                appConfig.acc_address,
                appConfig.acc_pri_k,
                appInfoFilePath
              );

          resolve();
        } catch(e) {
          console.log(e)
          reject('App deployment failed');
        }
      }else{
        reject('App compilation failed');
      }
    }else{
      reject('App not connected to blockchain');
    }
  });
}

/* Deploy token contracts on blockchain */
function deployToken(totalTokens){
  return new Promise(async (resolve, reject) => {
    const web3_tkn = new Web3(new Web3.providers.HttpProvider(tknConfig.provider));
    if(web3_tkn.isConnected()){
      web3_tkn.eth.defaultAccount = tknConfig.acc_address;
      const contCompiled = compiler.compileToken();

      if(contCompiled) {
        try{
          await deployRt(
            web3_tkn,
            tknConfig.name,
            [(totalTokens == null ? TOTAL_TOKENS : totalTokens), tknConfig.acc_address],
            contCompiled.Snail.Snail.evm.bytecode.object,
            contCompiled.Snail.Snail.evm.gasEstimates.creation.totalCost,
            contCompiled.Snail.Snail.abi,
            tknConfig.acc_address,
            tknConfig.acc_pri_k,
            tokenInfoFilePath
          );
          resolve();

        } catch(e) {
          reject('Token deployment failed');
        }
      } else {
        reject('Token compilation failed');
      }
    } else {
      reject('Token not connected to blockchain');
    }
  })
}

/* Deploy all contracts  to the blockchain */
function deploy() {
  return new Promise((resolve, reject) => {
    (async () =>{
      try{
        await deployToken();
        await deployApp();
        
        resolve();
      }catch(e){
        reject(e);
      }
    })();

  });
}

module.exports = {
  deploy: deploy,
  deployApp: deployApp,
  deployToken: deployToken
}
