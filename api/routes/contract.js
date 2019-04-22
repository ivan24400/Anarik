const express = require('express');
const router = express.Router();
const path = require('path');
const web3Helper = require('web3-helper');

const connect = require(path.join(__dirname, '..', 'network', 'connect.js'));
const loader = require(path.join(__dirname, '..', 'network', 'loader.js'));
const deploy = require(path.join(__dirname, '..', 'network', 'deploy.js'));

const appConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'app.js'));
const userConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'user.js'));
const tknConfig = require(path.join(__dirname, '..', 'config', 'contracts', 'deploy', 'token.js'));

/** Deploy all contracts to blockchain */
router.post('/deploy', (req, res, next) => {
  const jsonRes = {};
  jsonRes.success = false;
  jsonRes.msg = 'NA';

  deploy.deploy()
    .then(() => {
      jsonRes.success = true;
      jsonRes.msg = 'Contracts deployed successfully';
    })
    .catch(e => {
      res.status(500);
      jsonRes.msg = 'Something failed';
    })
    .finally(() => {
      res.json(jsonRes);
    });
});

/** Load all contracts */
router.post('/load', (req, res, next) => {
  const jsonRes = {};
  jsonRes.success = false;
  jsonRes.msg = 'NA';

  loader.load()
    .then(() => {
      jsonRes.success = true;
      jsonRes.msg = 'Contracts loaded successfully';
    })
    .catch(result => {
      res.status(500);
      jsonRes.msg = result;
    })
    .finally(() =>{
      res.json(jsonRes);
    });
});

/** Retrieve ether balance in both blockchain */
router.get('/balance', (req, res, next) => {
  const jsonRes = {};
  jsonRes.success = false;
  jsonRes.msg = 'NA';

  jsonRes.balance = {};
  try {
    jsonRes.balance.app = connect.get(appConfig.name).web3.eth.getBalance(appConfig.acc_address).toString();
    jsonRes.balance.tkn = connect.get(tknConfig.name).web3.eth.getBalance(tknConfig.acc_address).toString();
  } catch (e) {
    jsonRes.msg = 'Unable to get balance';
  }

  if (Object.values(jsonRes.balance).length > 0) {
    jsonRes.success = true;
  }
  res.json(jsonRes);
});

/** Test */
router.get('/item', (req, res) => {
  connect.get('Anarik').inst.getItemCount(
    (err, result) => {
      console.log(err); console.log(result);
      res.json(result);
    });
});

router.get('/acc_address', (req, res) => {
  connect.get('Anarik').inst.getUserNameFromAcc(
    req.body.addr,
    {from: appConfig.acc_address},
    (err, result) => {
      console.log('inside'); console.log(err); console.log(result);
      res.json(result);
    });
});

router.get('/verify_cred', (req, res) => {
  const jsonRes = {};
  web3Helper.sendRawTransaction(
    connect.get('Anarik').web3,
    userConfig.acc_pri_k,
    userConfig.acc_address,
    null,
    userConfig.DEFAULT_GAS,
    userConfig.acc_address,
    connect.get('Anarik').inst.address,
    connect.get('Anarik').inst.verifyCredential.getData(
      req.body.l_username,
      req.body.l_password,
    )
  )
    .then(receipt => {
      jsonRes.success = true;
      jsonRes.msg = 'successfully';
      jsonRes.receipt = receipt;
    })
    .catch(e => {
      jsonRes.msg = 'failed';
      jsonRes.error = e;
      res.status(500);
    })
    .finally(() => {
      res.json(jsonRes);
    });
});

module.exports = router;
