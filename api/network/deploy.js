const Web3 = require('web3');

let connect = require("./connect.js");
let loader = require("./loader.js");

let app_config = require('./config/app.js');
let token_config = require('./config/token.js');
const appInfoFilePath = "./info/app.js";
const tokenInfoFilePath = "./info/token.js";

/* Initialize deployment process */
function deployInit(){
    loader.reset();
}

/**
 * Contract deployment template
 * @param web3 web3 instance of the blockchain
 * @param contName contract name
 * @param bytecode contract bytecode
 * @param abi contract abi
 * @param fromAddr user account address which will deploy the contract
 * @param infoFilePath file path to store abi and byte code.
 */
function deploy(web3, contName, bytecode, abi, fromAddr, infoFilePath){
    console.log('Deploying '+contName+' contracts =========='+web3.eth.coinbase);

    let gasEstimate = web3.eth.estimateGas({data: JSON.stringify(bytecode)});
    console.log("Gas estimate:"+gasEstimate);
    let _cont = web3.eth.contract(JSON.parse(JSON.stringify(abi)));

    let contPromise = new Promise(function(resolve, reject){
      let cont = _cont.new(
        {
          from: fromAddr,
          gas: gasEstimate + gasEstimate*0.5,
          data: bytecode
        },
        function(err,result){
          if(!err){
            if(result.address)
              resolve([result,cont]);
          }else{
            reject(err);
          }
        }
      );
    });

    contPromise.then(function(result){
      let contRes = result[0];
      let contInst = result[1];
      console.log('Deployed '+contName+' at:'+contRes.address);
      if(contRes.address == null){
        return;
      }

      let infoFileContent = {
          c_address: contRes.address,
          c_abi: abi
        };

      fs.writeFile(infoFilePath, JSON.stringify(infoFileContent), function(err) {
          if(err) {
              return console.log(err);
          }
          console.log("Info file created");
      });
      connect.add(contName, web3, contInst, contRes.address);
    })
    .catch(function(err){
      console.log("Error encountered");
      console.log(err);
    });
}

/* Deploy App contracts on blockchain */
function deployApp(){

  let web3_app = new Web3(new Web3.providers.HttpProvider(app_config.provider));
  if(web3_app.isConnected()){
    web3_app.eth.defaultAccount = web3_app.eth.coinbase;
    let contCompiled = compiler.compileApp();
    if(contCompiled){
      deploy(
        web3_app,
        app_config.name,
        contCompiled.Anarik.Anarik.evm.bytecode.object,
        app_config.acc_address,
        appInfoFilePath
      );
    }else{
      console.log('Deployment failed');
    }
  }else{
    console.log('Not connected to blockchain');
  }
}

/* Deploy token contracts on blockchain */
function deployToken(){

  let web3_tkn = new Web3(new Web3.providers.HttpProvider(tkn_config.provider));
  if(web3_tkn.isConnected()){
    web3_tkn.eth.defaultAccount = web3_tkn.eth.coinbase;

    let contCompiled = compiler.compileToken();
    if(contCompiled){
      deploy(
        web3_tkn,
        tkn_config.name,
        contCompiled.Snail.Snail.evm.bytecode.object,
        tkn_config.acc_address,
        tokenInfoFilePath
      );
    }else{
      console.log('Deployment failed');
    }
  }else{
    console.log('Not connected to blockchain');
  }
}

module.exports = {
  deployApp: deployApp,
  deployToken: deployToken
}
