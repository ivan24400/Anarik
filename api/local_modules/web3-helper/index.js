var Tx = require('ethereumjs-tx');
var web3_utils = require('web3-utils');

/** Get transaction receipt after a transaction is mined
  * @param web3Instance web3 instance connected to blockchain
  * @param txHash transaction hash
  * @param interval retry time in milliseconds
  * @return a promise object
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
            oneTxHash => self.getTransactionReceiptMined(oneTxHash, interval)));
    } else if (typeof txHash === "string") {
        return new Promise(transactionReceiptAsync);
    } else {
        throw new Error("Invalid Type: " + txHash);
    }
}

/** Send a raw transaction to blockchain
  * @param web3_inst web3 instance connected to blockchain
  * @param privateKey private key of wallet
  * @param accAddr contract address
  * @param gasPrice custom gas price
  * @param gasLimit gas units to use
  * @param from transaction sender
  * @param to transaction receiver
  * @param data function data
  * @return a promise object
  */
function sendRawTransaction(web3_inst, privateKey, accAddr, gasPrice, gasLimit, from, to, data){

  let sendRawTxn = async function(resolve, reject){

    let transactionCount = await web3_inst.eth.getTransactionCount(accAddr, 'pending');

    const nonce = web3_utils.toHex(transactionCount);

    if(gasPrice == null){
      gasPrice =  web3_utils.toHex(web3_inst.eth.gasPrice.toString());
    }

    let rawTx = {
      nonce : nonce,
      gasPrice : gasPrice,
      gasLimit : gasLimit,
      from : from,
      to : to,
      data : data
    }

    let tx = new Tx(rawTx);
    tx.sign(privateKey);
    let txSerialized = tx.serialize();

    web3_inst.eth.sendRawTransaction("0x"+txSerialized.toString('hex'), function(err, result){
      if(!err){
        getTransactionReceiptMined(web3_inst,result)
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
