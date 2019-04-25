/**
 * Index/home routes
 * @module routes/index
 * @requires express
 * @requires path
 */
const express = require('express');
const path = require('path');

const homeCntlr = require(path.join(__dirname, '..', 'app', 'controllers', 'home.js'));
const authCntlr = require(path.join(__dirname, '..', 'app', 'controllers', 'authentication.js'));

const router = express.Router();

/**
 * @api {get} / home
 * @apiVersion 1.0.0
 * @apiName Home
 * @apiGroup Home
 *
 * @apiSuccess {string} msg Anarik API v1
 *
 * @apiUse UnauthorizedError
 */
router.get('/', homeCntlr.home);

/**
 * @api {post} /login Login an user
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup Authentication
 *
 * @apiParam {string} l_username username
 * @apiParam {string} l_password password
 * 
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} username
 * @apiSuccess {number} Number of snails owned by user
 *
 * @apiUse UnauthorizedError
 */
router.post('/login', authCntlr.login);

/**
 * @api {post} /logout Logout an user
 * @apiVersion 1.0.0
 * @apiName Logout
 * @apiGroup Authentication
 *
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg Logout successfully
 *
 * @apiError {boolean} success false
 * @apiError {string} msg Something failed
 */
router.post('/logout', authCntlr.logout);

module.exports = router;
