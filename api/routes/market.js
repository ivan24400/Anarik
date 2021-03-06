const express = require('express');

const passportAuthenticate = require('../middlewares/passportAuthenticate');

const marketCntlr = require('../app/controllers/market');

// eslint-disable-next-line new-cap
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
router.put('/item', passportAuthenticate, marketCntlr.buyItem);

module.exports = router;
