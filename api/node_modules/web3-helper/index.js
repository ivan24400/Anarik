var Tx = require('ethereumjs-tx');
var web3_utils = require('web3-utils');
//ghost
/**
 * Convert a number to strict hex
 * @param num number to convert to strict hex
 * @return strict hex string
 */
function numToHexStrict(num){
  if(num != null && num != undefined){
    if(web3_utils.isHex(num)){
      if(!web3_utils.isHexStrict(num)) num = '0x' + num;
    }else{
      num = web3_utils.toHex(num);
    }
  }else{
    throw new Error('Invalid number');
  }
  return num;
}

/**
 * Get transaction receipt after a transaction is mined
 * @param web3Instance web3 instance connected to blockchain
 * @param txHash transaction hash
 * @param interval retry time in milliseconds
 * @return a promise object that returns transaction receipt
 */
function getTransactionReceiptMined(web3Instance, txHash, interval) {
    const self = this;
    const transactionReceiptAsync = function(resolve, reject) {
        web3Instance.eth.getTransactionReceipt(txHash, (error, receipt) => {
            if (error) {
                reject(error);
            } else if (receipt == null) {
                setTimeout(
                    () => transactionReceiptAsync(resolve, reject),
                    interval ? interval : 500);
            } else {
                resolve(receipt);
            }
        });
    };

    if (Array.isArray(txHash)) {
        return Promise.all(txHash.map(
            oneTxHash => self.getTransactionReceiptMined(web3Instance, oneTxHash, interval)));
    } else if (typeof txHash === "string") {
        return new Promise(transactionReceiptAsync);
    } else {
        throw new Error("Invalid Type: " + txHash);
    }
}

/**
 * Send a raw transaction to blockchain
 * @param web3_inst web3 instance connected to blockchain
 * @param privateKey private key of wallet
 * @param accAddr contract/account address
 * @param gasPrice custom gas price (in hex)
 * @param gasLimit gas units (in hex) to use
 * @param from transaction sender
 * @param to transaction receiver
 * @param data function data
 * @return a promise object with transaction receipt as its result
 */
function sendRawTransaction(web3_inst, privateKey, accAddr, gasPrice, gasLimit, from, to, data){

  let sendRawTxn = async function(resolve, reject){

    if(
      web3_inst == null ||
      privateKey == null ||
      accAddr == null ||
      from == null ||
      data == null
    ){
      reject('Invalid arguments');
    }

    let transactionCount = await web3_inst.eth.getTransactionCount(accAddr, 'pending');

    const nonce = web3_utils.toHex(transactionCount);

    // Default gas price
    if(gasPrice == null){
      gasPrice = web3_utils.toHex(web3_inst.eth.gasPrice.toString());
    }

    gasPrice = numToHexStrict(gasPrice);

    // Default gas limit is assumed to be 50% higher than estimation.
    if(gasLimit == null){
      gasLimit = parseInt(web3_inst.eth.estimateGas({from: from, data: data}));
      gasLimit = web3_utils.toHex(gasLimit + gasLimit*0.5);
    }

    gasLimit = numToHexStrict(gasLimit);

    //Check for strict hex
    if(from.slice(0,2) !== '0x') from = '0x' + from;
    if(to != null && to.slice(0,2) !== '0x') to = '0x' + to;

    let rawTx = {
      nonce: nonce,
      gasPrice: gasPrice,
      gasLimit: gasLimit,
      from: from,
      data: data
    }
    // Optional to/receiver
    if(to) rawTx.to = to;

    let tx = new Tx(rawTx);
    tx.sign(Buffer.from(privateKey, 'hex'));
    let txSerialized = tx.serialize();

    web3_inst.eth.sendRawTransaction("0x" + txSerialized.toString('hex'), function(err, result){
      if(!err){
        getTransactionReceiptMined(web3_inst, result)
        .then(function(receipts){
            resolve(receipts);
          })
        .catch(function(error){
            reject(error);
          });
      }else{
        reject(err);
      }
    });
  }
  return new Promise(sendRawTxn);
}

module.exports = {
  sendRawTransaction : sendRawTransaction,
  getTransactionReceiptMined : getTransactionReceiptMined
}
