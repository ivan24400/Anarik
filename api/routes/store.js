const express = require('express');

const storeCntlr = require('../app/controllers/user/store');
const passportAuthenticate = require('../middlewares/passportAuthenticate');

// eslint-disable-next-line new-cap
const router = express.Router();

/**
 * @api {get} /store Get user store details
 * @apiVersion 1.0.0
 * @apiName GetUserStore
 * @apiGroup Store
 *
 * @apiSuccess {boolean} success operation status
 * @apiSuccess {string} msg NA
 * @apiSuccess {Object[]} data list of user's store items
 *
 * @apiUse UnauthorizedError
 */
router.get('/', passportAuthenticate, storeCntlr.getUserStoreDetails);

/**
 * @api {post} /store/item Add an item in the user store
 * @apiVersion 1.0.0
 * @apiName AddItem
 * @apiGroup Store
 *
 * @apiParam {string} productName item name
 * @apiParam {string} productDesc item description
 * @apiParam {number} productPrice item price
 * @apiParam {boolean} productSale is item available for sale
 * @apiParam {number} productIndex item's index in database
 *
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg Added item successfully
 *
 * @apiUse UnauthorizedError
 */
router.post('/item', passportAuthenticate, storeCntlr.addItem);

/**
 * @api {put} /store/item Update an item in the store
 * @apiVersion 1.0.0
 * @apiName UpdateItem
 * @apiGroup Store
 *
 * @apiParam {string} productName item name
 * @apiParam {string} productDesc item description
 * @apiParam {number} productPrice item price
 * @apiParam {boolean} productSale is item available for sale
 * @apiParam {number} productIndex item's index in database
 *
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg Updated item successfully
 *
 * @apiUse UnauthorizedError
 */
router.put('/item', passportAuthenticate, storeCntlr.updateItem);

/**
 * @api {delete} /store/item Delete an item from the store
 * @apiVersion 1.0.0
 * @apiName DeleteItem
 * @apiGroup Store
 *
 * @apiParam {string} productName item name
 * @apiParam {string} productDesc item description
 * @apiParam {number} productPrice item price
 * @apiParam {boolean} productSale is item available for sale
 * @apiParam {number} productIndex item's index in database
 *
 * @apiSuccess {boolean} success true
 * @apiSuccess {string} msg Deleted item successfully
 *
 * @apiUse UnauthorizedError
 */
router.delete('/item', passportAuthenticate, storeCntlr.deleteItem);

module.exports = router;
