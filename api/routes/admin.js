/**
 * Admin routes
 * @module routes/admin
 * @requires express
 * @requires path
 */
const express = require('express');

const passportAuthenticate = require('../middlewares/passportAuthenticate');

const adminController = require('../app/controllers/user/admin');

// eslint-disable-next-line new-cap
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
 * @apiSuccess {string} msg Token transferred successfully
 *
 * @apiError {boolean} success false
 * @apiError {string} msg Token transfer failed
 *
 * @apiUse UnauthorizedError
 */
router.post('/tokens', passportAuthenticate, adminController.sendTokens);

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
 *
 * @apiError {boolean} success false
 * @apiError {string} msg Unable to retrieve user's account
 *
 * @apiUse UnauthorizedError
 */
router.post('/req', passportAuthenticate, adminController.acknowledgeRequest);

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
 *
 * @apiUse UnauthorizedError
 */
router.delete('/req', passportAuthenticate, adminController.rejectRequest);

module.exports = router;
