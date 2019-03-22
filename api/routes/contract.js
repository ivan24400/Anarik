let express = require('express');
let router = express.Router();
let path = require('path');

let connect = require(path.join(__dirname, '..', 'network', 'connect.js'));
let loader = require(path.join(__dirname, '..', 'network', 'loader.js'));
let deploy = require(path.join(__dirname, '..', 'network', 'deploy.js'));

let appConfig = require(path.join(__dirname, '..', 'network', 'config', 'app.js'));
let tknConfig = require(path.join(__dirname, '..', 'network', 'config', 'token.js'));

/* Deploy all contracts to blockchain */
router.post('/deploy', function(req,res,next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";

  deploy.deploy()
  .then( () => {

    json_res.success = true;
    json_res.msg = "Contracts deployed successfully";

  })
  .catch( (e) => {

    res.status(500);
    json_res.msg = "Something failed";

  })
  .finally( () => {
    res.json(json_res);
  });
});

/* Load all contracts */
router.post('/load', function(req, res, next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";

  loader.load()
  .then(function(){

    json_res.success = true;
    json_res.msg = "Contracts loaded successfully";

  })
  .catch(function(result){

    res.status(500);
    json_res.msg = result;

  })
  .finally(() =>{
    res.json(json_res);
  });
});

/* Test connection to blockchain */
router.get('/test_connection', function(req, res, next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = 'NA';

  json_res.balance = {};
  try{
    json_res.balance.app = connect.get(appConfig.name).web3.eth.getBalance(appConfig.acc_address).toString();
    json_res.balance.tkn = connect.get(tknConfig.name).web3.eth.getBalance(tknConfig.acc_address).toString();
  } catch(e) {
    json_res.msg = "Unable to get balance";
  }

  if(Object.values(json_res.balance).length > 0){
    json_res.success = true;
  }
  res.json(json_res);
});

module.exports = router;
