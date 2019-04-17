let path = require('path');
let errors = require(path.join(__dirname,'..', 'lib', 'errors.js'));
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
 */
function addContract(name, web3Inst, contInst){
  if(contracts == null) reset();
  contracts[name] = {
    web3: web3Inst,
    inst: contInst,
    gas: web3Inst.eth.getBlock('latest').gasLimit
  }
}

/**
 * Retrieve a contract object
 * @param name name of contract to be retrieved.
 * @return the contract object
 */
function getContract(name){
  if(contracts != null && name !== undefined && contracts[name] !== undefined){
    return contracts[name];
  }else{
    throw new Error(errors.UNDEFINED_CONTRACT);
  }
}

module.exports = {
  _admin: "light",
  _admin_pass: "dark",
  reset: reset,
  add: addContract,
  get: getContract
}
