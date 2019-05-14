const express = require('express');

const authCntlr = require('../app/controllers/authentication');
const userActionsCntlr = require('../app/controllers/user/actions');
const passportAuthenticate = require('../middlewares/passportAuthenticate');

// eslint-disable-next-line new-cap
const router = express.Router();
/**
 * @api {post} /user/req-tokens Request tokens (from admin)
 * @apiVersion 1.0.0
 * @apiName TokenRequest
 * @apiGroup User
 *
 * @apiParam {number} tokenCount Number of tokens
 *
 * @apiSuccess {boolean} success operation status
 * @apiSuccess {string} msg Token requested successfully
 *
 * @apiUse UnauthorizedError
 */
router.post('/req-tokens', passportAuthenticate, userActionsCntlr.requestTokens);

/**
 * @api {get} /user/purchase-history Retrieve purchase history of user
 * @apiVersion 1.0.0
 * @apiName PurchaseHistory
 * @apiGroup User
 *
 * @apiSuccess {boolean} success operation status
 * @apiSuccess {Object[]} data Purchase history list
 *
 * @apiUse UnauthorizedError
 */
router.get('/purchase-history', passportAuthenticate, userActionsCntlr.purchaseHistory);

/**
 * @api {get} /user/token Refresh access token
 * @apiVersion 1.0.0
 * @apiName RefreshToken
 * @apiGroup User
 *
 * @apiSuccess {boolean} success operation status
 * @apiSuccess {string} token Access token
 *
 * @apiError Invalid token
 */
router.get('/token', passportAuthenticate, authCntlr.refreshToken);

module.exports = router;
