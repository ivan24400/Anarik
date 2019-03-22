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
    addr: contAddr,
    gas: web3Inst.eth.getBlock('latest').gasLimit
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
    throw new Error('Undefined contract');
  }
}

module.exports = {
  _admin: "light",
  _admin_pass: "dark",
  reset: reset,
  add: addContract,
  get: getContract
}
