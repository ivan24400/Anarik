const Tx = require('ethereumjs-tx');
const web3Utils = require('web3-utils');
const path = require('path');
const _utils = require(path.join(__dirname, 'utils.js'));

/**
 * Convert a number to strict hex
 * @param {integer | string} num - number to convert to strict hex
 * @return {string} strict hex string
 */
function numToHexStrict(num) {
  if (num != null && num != undefined) {
    if (web3Utils.isHex(num)) {
      if (!web3Utils.isHexStrict(num)) num = '0x' + num;
    } else {
      num = web3Utils.toHex(num);
    }
  } else {
    throw new Error('Invalid number');
  }
  return num;
}

/**
 * Get transaction receipt after a transaction is mined
 * @param {Object} web3Instance - web3 instance connected to blockchain
 * @param {Object} txHash - transaction hash
 * @param {number} interval - retry time in milliseconds
 * @return {Object} a promise object that returns transaction receipt
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
    return Promise.all(
      txHash.map(
        oneTxHash => self.getTransactionReceiptMined(web3Instance, oneTxHash, interval)
      )
    );
  } else if (typeof txHash === 'string') {
    return new Promise(transactionReceiptAsync);
  } else {
    throw new Error('Invalid Type: ' + txHash);
  }
}

/**
 * Send a raw transaction to blockchain
 * @param {Object} web3Inst web3 instance connected to blockchain
 * @param {string} privateKey private key of wallet
 * @param {string} accAddr contract/account address
 * @param {string} gasPrice custom gas price (in hex)
 * @param {string} gasLimit gas units (in hex) to use
 * @param {string} from transaction sender
 * @param {string} to transaction receiver
 * @param {Object} data function data
 * @return {Object} a promise object with transaction receipt as its result
 */
function sendRawTransaction(
  web3Inst,
  privateKey,
  accAddr,
  gasPrice,
  gasLimit,
  from,
  to,
  data
) {
  const sendRawTxn = async function(resolve, reject) {
    try {
      if (
        web3Inst == null ||
        privateKey == null ||
        accAddr == null ||
        from == null ||
        data == null
      ) {
        reject('Invalid arguments');
      }

      const transactionCount = await web3Inst.eth.getTransactionCount(accAddr, 'pending');

      const nonce = web3Utils.toHex(transactionCount);

      // Default gas price
      if (gasPrice == null || isNaN(gasPrice)) {
        gasPrice = web3Utils.toHex(web3Inst.eth.gasPrice.toString());
      }

      gasPrice = numToHexStrict(gasPrice);

      // Default gas limit is assumed to be 50% higher than estimation.
      if (gasLimit == null || isNaN(gasLimit)) {
        gasLimit = parseInt(web3Inst.eth.estimateGas({'from': from, 'data': data}));
        gasLimit = web3Utils.toHex(gasLimit + gasLimit*0.5);
      }

      gasLimit = numToHexStrict(gasLimit);

      // Check for strict hex
      if (from.slice(0, 2) !== '0x') from = '0x' + from;
      if (to != null && to.slice(0, 2) !== '0x') to = '0x' + to;

      const rawTx = {
        nonce: nonce,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        from: from,
        data: data,
      };
      // Add to/receiver if available
      if (to) rawTx.to = to;

      const tx = new Tx(rawTx);
      tx.sign(Buffer.from(privateKey, 'hex'));
      const txSerialized = tx.serialize();

      web3Inst.eth.sendRawTransaction('0x' + txSerialized.toString('hex'), function(err, result) {
        if (!err) {
          getTransactionReceiptMined(web3Inst, result)
            .then(function(receipts) {
              resolve(receipts);
            })
            .catch(function(error) {
              reject(error);
            });
        } else {
          reject(err);
        }
      });
    } catch (e) {
      reject(e);
    }
  }
  return new Promise(sendRawTxn);
}

module.exports = {
  sendRawTransaction: sendRawTransaction,
  getTransactionReceiptMined: getTransactionReceiptMined,
  getRandomAddress: _utils.getRandomAddress,
}
