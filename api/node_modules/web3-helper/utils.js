let keythereum = require('keythereum');

/**
 * Generate a random solidity address value
 * @param keyBytes number of bytes in private key (optional)
 * @param ivBytes number of bytes in initialization vector (optional)
 * @return A ethereum address value
 */
function getRandomAddress(keyBytes, ivBytes){
  let params = {
    keyBytes: (keyBytes ? keyBytes : 32),
    ivBytes: (ivBytes ? ivBytes : 16)
  };
  let dk = keythereum.create(params);
  return keythereum.privateKeyToAddress(dk.privateKey);
}

module.exports = {
  getRandomAddress: getRandomAddress
}
