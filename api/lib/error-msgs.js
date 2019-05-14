/**
 * List of known error messages
 * @module lib/error-msgs
 */

/**
 * Error code description
 * 0000 - 0499: Authentication errors
 * 0500 - 0999: Login errors
 * 1000 - 1499: Contract compilation errors
 * 1500 - 1999: Contract deployment errors
 * 2000 - 2499: Contract loading errors
 */

module.exports = {
  '0': 'Invalid credentials',
  'revert Invalid credentials': 'Invalid credentials',
  '1': 'Something failed',
  '500': 'User data not available',
  '1001': 'No contracts found',
};
