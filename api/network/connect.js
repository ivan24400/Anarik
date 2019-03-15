// const Web3 = require('web3');
//
// const appConfig = require('./config/app.js');
// const appInfo = require('./info/app.js');
// const tknConfig = require('./config/token.js');
// const tknInfo = require('./info/token.js');
//
// let connect = (function(){
//
//     this._admin = "ace";
//     this._admin_pass = "spear";
//
//     //Private blockchain
//     this.app_config = appConfig;
//     this.web3_app = new Web3(new Web3.providers.HttpProvider(app_config.provider));
//     this.web3_app.eth.defaultAccount = app_config.acc_address;
//     this.contAnarikAccAddr = null; //web3_app.eth.accounts[0];
//     // this.web3_app.personal.unlockAccount(web3_app.eth.defaultAccount,app_config.acc_password);
//     //this.contAnarik = null; //web3_app.eth.contract(appInfo.c_abi).at(appInfo.c_address);
//
//     console.log("web3_app is connected:"+this.web3_app.isConnected());
//     console.log("web3_app accounts:");console.log(this.web3_app.eth.accounts);console.log("default:"+this.web3_app.eth.defaultAccount);
//
//     //Public blockchain
//     this.tkn_config = tknConfig;
//     this.pub_privateKey = Buffer.from(tkn_config.private_key,'hex');
//     this.web3_tkn = new Web3(new Web3.providers.HttpProvider(tkn_config.provider));
//     this._adminAccAddr = tkn_config.acc_address;
//     this.contSnailAccAddr = _adminAccAddr;
//     this.contSnail = null; //web3_tkn.eth.contract(tknInfo.c_abi).at(tknInfo.c_address);
//
//     console.log("web3_tkn is connected:"+this.web3_tkn.isConnected());
//     this.web3_tkn.version.getNetwork((err, netId) => {
//       process.stdout.write('Public network name:');
//       switch (netId) {
//         case "1":
//           console.log('mainnet')
//           break
//         case "2":
//           console.log('morden')
//           break
//         case "3":
//           console.log('ropsten')
//           break
//         default:
//           console.log('unknown');
//       }
//       console.log("Balance:"+web3_tkn.eth.getBalance(contSnailAccAddr).toString());
//     });
//
//     return this;
// })();
//
// module.exports = connect;

/**
 * 'contracts' is a dictionary with following structure:
 * contracts['name'] = {
 *  web3: web3Instance,
 *  inst: contractInstance,
 *  addr: contractAddress,
 * }
 */
let contracts = null;

/* Initialize contracts */
function reset(){
  contracts = new Object();
}

/**
 * Adds an existing contract instance to a dictionary
 * @param name fullname of the contract
 * @param web3Inst web3 instance associated with the contract
 * @param contInst instance of deployed contract
 * @param contAddr address at which contract is deployed
 */
function addContract(name, web3Inst, contInst, contAddr){
  if(contracts == null) reset();
  contracts[name] = {
    web3: web3Inst,
    inst: contInst,
    addr: contAddr
  }
}

/**
 * Retrieve a contract object
 * @param name name of contract to be retrieved.
 * @return the contract object
 */
function getContract(name){
  if(name !== undefined && contracts[name] !== undefined){
    return contracts[name];
  }else{
    throw new Error('Undefined contract name');
  }
}

module.exports = {
  reset: reset,
  add: addContract,
  get: getContract
}
