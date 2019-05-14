const express = require('express');

const userAccountController = require('../app/controllers/user/account');

// eslint-disable-next-line new-cap
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

module.exports = router;
