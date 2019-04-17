let express = require('express');
let router = express.Router();
let path = require('path');

let connect = require(path.join(__dirname, '..', 'network', 'connect.js'));
let loader = require(path.join(__dirname, '..', 'network', 'loader.js'));
let deploy = require(path.join(__dirname, '..', 'network', 'deploy.js'));

const appConfig = require(path.join(__dirname, '..', 'network', 'config', 'app.js'));
const tknConfig = require(path.join(__dirname, '..', 'network', 'config', 'token.js'));

/** Deploy all contracts to blockchain */
router.post('/deploy', (req, res, next) => {
  let jsonRes = new Object();
  jsonRes.success = false;
  jsonRes.msg = "NA";

  deploy.deploy()
  .then(() => {
    jsonRes.success = true;
    jsonRes.msg = "Contracts deployed successfully";
  })
  .catch((e) => {
    res.status(500);
    jsonRes.msg = "Something failed";
  })
  .finally(() => {
    res.json(jsonRes);
  });
});

/** Load all contracts */
router.post('/load', (req, res, next) => {
  let jsonRes = new Object();
  jsonRes.success = false;
  jsonRes.msg = "NA";

  loader.load()
  .then(() => {
    jsonRes.success = true;
    jsonRes.msg = "Contracts loaded successfully";
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
  let jsonRes = new Object();
  jsonRes.success = false;
  jsonRes.msg = 'NA';

  jsonRes.balance = {};
  try{
    jsonRes.balance.app = connect.get(appConfig.name).web3.eth.getBalance(appConfig.acc_address).toString();
    jsonRes.balance.tkn = connect.get(tknConfig.name).web3.eth.getBalance(tknConfig.acc_address).toString();
  } catch(e) {
    jsonRes.msg = "Unable to get balance";
  }

  if(Object.values(jsonRes.balance).length > 0){
    jsonRes.success = true;
  }
  res.json(jsonRes);
});

/** Test */
router.get('/item', (req, res) => {
  connect.get('Anarik').inst.getItem(
    req.body.index,
    {from: appConfig.acc_address},
    (err, result) => {
      console.log('inside'); console.log(err); console.log(result);
      res.json(result);
    });
});

router.get('/acc_address', (req, res) => {
  connect.get('User').inst.getUserNameFromAcc(
    req.body.addr,
    {from: appConfig.acc_address},
    (err, result) => {
      console.log('inside'); console.log(err); console.log(result);
      res.json(result);
    });
});

module.exports = router;
