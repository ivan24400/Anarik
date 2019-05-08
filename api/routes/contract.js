/**
 * Contract routes
 * @module routes/contract
 * @requires express
 * @requires path
 */
const express = require('express');
const path = require('path');

const contractsCntlr = require(path.join(
  __dirname, '..', 'app', 'controllers', 'contracts'
));

// eslint-disable-next-line new-cap
const router = express.Router();


/**
 * @api {post} /contract/deploy Deploy all contracts
 * @apiVersion 1.0.0
 * @apiName Deploy
 * @apiGroup Contract
 *
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg Contracts deployed successfully
 *
 * @apiUse GenericFail
 */
router.post('/deploy', contractsCntlr.deploy);

/**
 * @api {post} /contract/load Load all contracts
 * @apiVersion 1.0.0
 * @apiName Load
 * @apiGroup Contract
 *
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg Contracts loaded successfully
 *
 * @apiUse GenericFail
 */
router.post('/load', contractsCntlr.load);

/**
 * @api {get} /contract/balance Retrieve blockchian's account balance
 * @apiVersion 1.0.0
 * @apiName Balance
 * @apiGroup Contract
 *
 * @apiSuccess {boolean} success true
 * @apiSuccess {Object} balance Account balance
 *
 * @apiUse GenericFail
 */
router.get('/balance', contractsCntlr.getBalances);

module.exports = router;
