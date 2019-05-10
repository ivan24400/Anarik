/**
 * Simplify error message
 * @module lib/error-simple
 */

const msgs = require('./error-msgs');

/**
 * Simplify error messages to REST response
 * @param {Object} err - Error object
 * @return {Object} reply object
 */
const simplifier = err => {
  const reply = {};
  reply.success = false;
  reply.msg = 'Something failed';

  if (msgs.hasOwnProperty(err.message.split(':')[0])) {
    reply.msg = msgs[err.message.split(':')[0]];
  }
  return reply;
};

module.exports = simplifier;
