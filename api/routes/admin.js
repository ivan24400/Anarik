/**
 * Admin routes
 * @module routes/admin
 * @requires express
 * @requires path
 */
const express = require('express');
const path = require('path');

const adminController = require(path.join(__dirname, '..', 'app', 'controllers', 'user', 'admin.js'));

const router = express.Router();

/**
 * @api {post} /admin/tokens Send/Donate tokens to an user
 * @apiVersion 1.0.0
 * @apiName SendTokens
 * @apiGroup Admin
 *
 * @apiParam {string} tokenRecvr username of token receiver
 * @apiParam {number} tokenCount number of tokens to send
 * 
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg Token request acknowledged successfully
 *
 * @apiError {boolean} success false
 * @apiError {string} msg Request acknowledgement failed
 */
router.post('/tokens', adminController.sendTokens);

/**
 * @api {post} /admin/req Acknowledge an user's token request
 * @apiVersion 1.0.0
 * @apiName AcknowledgeTokenRequest
 * @apiGroup Admin
 *
 * @apiParam {number} tokenRequestIndex index of token in token request's list
 * 
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg Token request acknowledged successfully
 *
 * @apiError {boolean} success false
 * @apiError {string} msg Request acknowledgement failed
 */
router.post('/req', adminController.acknowledgeRequest);

/**
 * @api {delete} /admin/req Reject an user's token request
 * @apiVersion 1.0.0
 * @apiName RejectTokenRequest
 * @apiGroup Admin
 *
 * @apiParam {number} tokenRequestIndex index of token in token request's list
 * 
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg Token request rejected successfully
 *
 * @apiError {boolean} success false
 * @apiError {string} msg Request rejection failed
 */
router.delete('/req', adminController.rejectRequest);

module.exports = router;
