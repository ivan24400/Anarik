const express = require('express');
const path = require('path');
const router = express.Router();


const adminController = require(path.join(__dirname, '..', 'app', 'controllers', 'user', 'admin.js'));

/**
 * Send tokens to a given user
 */
router.post('/send-tokens', adminController.sendTokens);

/**
 * Acknowledge a token request
 */
router.post('/ack-req', adminController.acknowledgeRequest);

/** Reject a token request */
router.post('/rej-req', adminController.rejectRequest);

module.exports = router;
