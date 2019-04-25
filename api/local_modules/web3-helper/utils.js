/**
 * Utility functions
 * @requires keythereum
 */

const keythereum = require('keythereum');

/**
 * Generate a random solidity address value
 * @param {number} keyBytes - number of bytes in private key (optional)
 * @param {number} ivBytes number of bytes in initialization vector (optional)
 * @return {string} A ethereum address value
 */
function getRandomAddress(keyBytes, ivBytes) {
  const params = {
    keyBytes: (keyBytes ? keyBytes : 32),
    ivBytes: (ivBytes ? ivBytes : 16),
  };
  const dk = keythereum.create(params);
  return keythereum.privateKeyToAddress(dk.privateKey);
}

module.exports = {
  getRandomAddress: getRandomAddress,
};
