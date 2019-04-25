const express = require('express');
const path = require('path');

const marketCntlr = require(path.join(__dirname, '..', 'app', 'controllers', 'market.js'));

const router = express.Router();

/**
 * @api {get} /market Get market details
 * @apiVersion 1.0.0
 * @apiName GetMarket
 * @apiGroup Market
 *
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg NA
 * @apiSuccess {Object[]} data list of market items
 *
 * @apiUse UnauthorizedError
 */
router.get('/', marketCntlr.getMarket);

/**
 * @api {put} /market/item Buy an item
 * @apiVersion 1.0.0
 * @apiName Buyitem
 * @apiGroup Market
 *
 * @apiParam {number} productIndex index number of item
 * 
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg Market item transacted successfully
 *
 * @apiUse UnauthorizedError
 */
router.put('/item', marketCntlr.buyItem);

module.exports = router;
