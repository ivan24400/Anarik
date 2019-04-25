const express = require('express');
const path = require('path');

const userActionsController = require(path.join(__dirname, '..', 'app', 'controllers', 'user', 'actions.js'));
const userAccountController = require(path.join(__dirname, '..', 'app', 'controllers', 'user', 'account.js'));

const router = express.Router();

/**
 * @api {post} /user Add a new user
 * @apiVersion 1.0.0
 * @apiName AddUser
 * @apiGroup User
 *
 * @apiUse UnauthorizedError
 */
router.post('/', userAccountController.addUser);

/**
 * @api {put} /user Update an existing user
 * @apiVersion 1.0.0
 * @apiName UpdateUser
 * @apiGroup User
 *
 * @apiParam {string} username registered username
 * @apiParam {string} oldPassword current user's password
 * @apiParam {string} newPassword new password
 *
 * @apiSuccess {boolean} success operation status
 * @apiSuccess {string} msg User updated successfully
 *
 * @apiUse UnauthorizedError
 */
router.put('/', userAccountController.updateUser);

/**
 * @api {delete} /user Delete an existing user
 * @apiVersion 1.0.0
 * @apiName DeleteUser
 * @apiGroup User
 *
 * @apiParam {string} username registered username
 * @apiParam {string} password registered user's password
 *
 * @apiSuccess {boolean} success operation status
 * @apiSuccess {string} msg User deleted successfully
 *
 * @apiUse UnauthorizedError
 */
router.delete('/', userAccountController.deleteUser);

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
router.post('/req-tokens', userActionsController.requestTokens);

/**
 * @api {get} /user/purchase-history Retrieve purchase history of user
 * @apiVersion 1.0.0
 * @apiName PurchaseHistory
 * @apiGroup User
 *
 * @apiSuccess {boolean} success operation status
 * @apiSuccess {string} msg User deleted successfully
 *
 * @apiUse UnauthorizedError
 */
router.get('/purchase-history', userActionsController.purchaseHistory);


module.exports = router;
