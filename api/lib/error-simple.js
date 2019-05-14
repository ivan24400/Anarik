/**
 * Simplify error message
 * @module lib/error-simple
 */

const msgs = require('./error-msgs');

/**
 * Simplifies EVM exception
 * @param {string} msg - Exception message
 * @return {string} simplified message
 */
const vmExceptionSimplify = msg => {
  result = 'Internal error occurred';
  Object.keys(msgs).every(e => {
    if (e == msg) {
      result = msgs[e];
      return false;
    }
    return true;
  });
  return result;
};

/**
 * Simplify error messages to REST response
 * @param {Object} err - Error object
 * @return {Object} reply object
 */
const simplifier = err => {
  msg = 'Something failed';

  if (err.message.indexOf('VM Exception') == 0) {
    msg = vmExceptionSimplify(err.message.split(': ')[1]);
  } else if (msgs.hasOwnProperty(err.message.split(':')[0])) {
    msg = msgs[err.message.split(':')[0]];
  }
  return msg;
};

module.exports = simplifier;
