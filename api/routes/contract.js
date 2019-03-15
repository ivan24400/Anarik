let express = require('express');
let router = express.Router();

let connect = require('../network/connect.js');
let loader = require('../network/loader.js');
let deploy = require('../network/deploy.js');

let appConfig = require('../network/config/app.js');
let tknConfig = require('../network/config/token.js');


router.post('/deploy', function(req,res,next){

});

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
    console.log(result);
    json_res.msg = result;
  })
  .finally(() =>{
    res.json(json_res);
  })
});

router.get('/test_connection', function(req, res, next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = 'NA';

  json_res.balance = {};
  try{
    json_res.balance.app = connect.get(appConfig.name).web3.eth.getBalance(appConfig.acc_address).toString();
    json_res.balance.tkn = connect.get(tknConfig.name).web3.eth.getBalance(tknConfig.acc_address).toString();
  } catch(e) {
    console.log(e);
    json_res.msg = "Unable to get balance";
  }

  if(Object.values(json_res.balance).length > 0){
    json_res.success = true;
  }
  res.json(json_res);
});

module.exports = router;
