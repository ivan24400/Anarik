/**
 * Simplify error message
 * @module lib/error-simple
 */

const path = require('path');
const msgs = require(path.join(__dirname, 'error-msgs'));

/**
 * Simplify error messages to REST response
 * @param {Object} err - Error object
 * @return {Object} reply object
 */
const simplifier = err => {
  const reply = {};
  reply.success = false;
  reply.msg = 'Something failed';

  if (err.message === msgs.UNDEFINED_CONTRACT) {
    reply.msg = 'No contracts found';
  }

  return reply;
};

module.exports = simplifier;
