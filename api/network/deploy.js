const Web3 = require('web3');
let Tx = require('ethereumjs-tx');
let fs = require('fs');
let path = require('path');

let web3_helper = require('web3-helper');

let connect = require(path.join(__dirname,'connect.js'));
let loader = require(path.join(__dirname,'loader.js'));
let compiler = require(path.join(__dirname,'compiler.js'));

let app_config = require(path.join(__dirname,'config','app.js'));
let tkn_config = require(path.join(__dirname,'config','token.js'));
const appInfoFilePath = path.join(__dirname,'info','app.js');
const tokenInfoFilePath = path.join(__dirname,'info','token.js');

/* Initialize deployment process */
function deployInit(){
    loader.reset();
}

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
function deployRt(web3, contName, bytecode, gas, abi, fromAddr, private_key, infoFilePath){
  return new Promise(function(_resolve, _reject){
    console.log('Deploying '+contName+' contracts =========='+web3.eth.coinbase);

    if(bytecode.slice(0,2) !== '0x') bytecode = '0x' + bytecode;

    let gasEstimate;
    try{
      gasEstimate = ( (isNaN(gas) || gas == null) ? web3.eth.estimateGas({data: bytecode}) : gas);
    }catch(e){
      gasEstimate = compiler.defaultGasLimit;
    }

    console.log("Gas estimate:"+gasEstimate);
    console.log('Block gas limit:'+web3.eth.getBlock("latest").gasLimit)
    console.log('Funds:'+web3.eth.getBalance(fromAddr));

    let _cont = web3.eth.contract(JSON.parse(JSON.stringify(abi)));

      web3_helper.sendRawTransaction(
        web3,
        private_key,
        fromAddr,
        null,
        gasEstimate,
        fromAddr,
        null,
        _cont.new.getData({data: bytecode})
      ).then( receipt => {
        let contAddr = receipt.contractAddress;
        let contInst = _cont.at(contAddr);
        console.log('Deployed '+contName+' at:'+contAddr);
        if(contAddr == null){
          return;
        }

        let infoFileContent = {
            c_address: contAddr,
            c_abi: abi
          };

        fs.writeFile(infoFilePath, JSON.stringify(infoFileContent), function(err) {
            if(err) {
                return console.log(err);
            }
        });
        connect.add(contName, web3, contInst, contAddr);
        _resolve();
      }).catch( err => {
        _reject(err);
      });
  });
}

/* Deploy App contracts on blockchain */
function deployApp(){

  return new Promise(async function(resolve,reject){
    let web3_app = new Web3(new Web3.providers.HttpProvider(app_config.provider));
    if(web3_app.isConnected()){

      web3_app.eth.defaultAccount = web3_app.eth.coinbase;

      let contCompiled = compiler.compileApp();
      if(contCompiled){
        try{
              let result = await deployRt(
                web3_app,
                app_config.name,
                contCompiled.Anarik.Anarik.evm.bytecode.object,
                contCompiled.Anarik.Anarik.evm.gasEstimates.creation.totalCost,
                contCompiled.Anarik.Anarik.abi,
                app_config.acc_address,
                app_config.acc_pk,
                appInfoFilePath
              );
          resolve();
        }catch(e){
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
function deployToken(){
  return new Promise(async function(resolve, reject){
    let web3_tkn = new Web3(new Web3.providers.HttpProvider(tkn_config.provider));
    if(web3_tkn.isConnected()){
      web3_tkn.eth.defaultAccount = web3_tkn.eth.coinbase;
      let contCompiled = compiler.compileToken();
      console.log('compile gas estimate:'+contCompiled.Snail.Snail.evm.gasEstimates.creation.totalCost)

      if(contCompiled){
        try{
          let result = await deployRt(
            web3_tkn,
            tkn_config.name,
            contCompiled.Snail.Snail.evm.bytecode.object,
            contCompiled.Snail.Snail.evm.gasEstimates.creation.totalCost,
            contCompiled.Snail.Snail.abi,
            tkn_config.acc_address,
            tkn_config.acc_pk,
            tokenInfoFilePath
          );
          resolve();

        }catch(e){
          reject('Token deployment failed');
        }

      }else{
        reject('Token compilation failed')
      }
    }else{
      reject('Token not connected to blockchain ')
    }
  })
}

/* Deploy all contracts  to the blockchain */
function deploy(){
  return new Promise(function(resolve, reject){
    (async () =>{
      try{
        await deployApp();
        await deployToken();
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
