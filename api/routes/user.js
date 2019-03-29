let express = require('express');
let router = express.Router();
let path = require('path');
var keythereum = require("keythereum");

let web3_helper = require('web3-helper');

let connect = require(path.join(__dirname,'..', 'network', 'connect.js'));
let app_config = require(path.join(__dirname, '..', 'network', 'config', 'app.js'));
let tkn_config = require(path.join(__dirname, '..', 'network', 'config', 'token.js'));

/** Add new user */
router.post('/', function(req, res, next) {
  let json_res = new Object();
  json_res.msg = "NA";
  json_res.success = false;

  if(req.session.username != null || req.session.user_account != null){
    res.redirect("../logout");
  }else{
    try{
      connect.get(app_config.name).inst.verifyCredential(
        req.body.s_username,
        req.body.s_password,
        {from: app_config.acc_address, gas: app_config.DEFAULT_GAS},
        function(err, result)
        {
          if(result){
            json_res.msg = 'User already exists';
            res.json(json_res);
          }else{
            var params = { keyBytes: 32, ivBytes: 16 };
            var dk = keythereum.create(params);
            let userAccAddr = keythereum.privateKeyToAddress(dk.privateKey);

            if(userAccAddr){
              let gasEstimateAu = connect.get(app_config.name).inst.addUser.estimateGas(
                req.body.s_username,
                userAccAddr,
                req.body.s_password
              );

              gasEstimateAu = Math.round(gasEstimateAu + gasEstimateAu*0.5);

              web3_helper.sendRawTransaction(
                connect.get(app_config.name).web3,
                app_config.acc_pri_k,
                app_config.acc_address,
                null,
                gasEstimateAu,
                app_config.acc_address,
                connect.get(app_config.name).inst.address,
                connect.get(app_config.name).inst.addUser.getData(
                  req.body.s_username,
                  userAccAddr,
                  req.body.s_password
                )
              ).then( receipt => {
                json_res.success = true;
                json_res.msg = "User created successfully";
              }).catch(e => {
                json_res.msg = 'User account creation failed';
                res.status(500);
              }).finally( () => {
                res.json(json_res);
              });

              // connect.get(app_config.name).inst.addUser(
              //   req.body.s_username,
              //   userAccAddr,
              //   req.body.s_password,
              //   {from: app_config.acc_address, gas: gasEstimateAu},
              //   function(err2, result2){
              //
              //     if(!err2){
              //       res.redirect("../logout");
              //     }else{
              //       json_res.msg = 'User account creation failed';
              //       res.status(500).json(json_res);
              //     }
              //   });
            }else{
                json_res.msg = "User account creation failed";
                res.status(500).json(json_res);
            }
          }
      });
    } catch(e) {
      json_res.msg = "Operation failed"
      res.json(json_res);
    }
  }
});

/** Buy tokens */
router.post('/req-tokens',function(req, res, next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";

  if(req.session.user_account != null){
    if(req.body.token_count != null){
      if(!isNaN(req.body.token_count)){

        let gasLimit = parseInt(connect.get(tkn_config.name).inst.addTokenRequest.estimateGas(
          req.session.username,
          req.session.user_account,
          req.body.token_count,
          {from: tkn_config.acc_address}
        ));

        gasLimit = Math.round(gasLimit + gasLimit*0.3);

        web3_helper.sendRawTransaction(
          connect.get(tkn_config.name).web3,
          tkn_config.acc_pri_k,
          tkn_config.acc_address,
          null,
          gasLimit,
          tkn_config.acc_address,
          connect.get(tkn_config.name).inst.address,
          connect.get(tkn_config.name).inst.addTokenRequest.getData(
            req.session.username,
            req.session.user_account,
            req.body.token_count
          )
        ).then(receipt => {

          json_res.success = true;
          json_res.msg = "Token requested successfully";
          res.json(json_res);

        }).catch(error => {
          json_res.msg = "Add token request failed";
          res.status(500).json(json_res);
        });

        }else{
          json_res.msg = "Invalid token count";
          res.status(400).json(json_res);
        }
      }else{
        json_res.msg = "Invalid input token count";
        res.status(400).json(json_res);
      }
    }else{
      json_res.msg = "Invalid account address";
      res.status(401).json(json_res);
    }
  });

/**
 * Get purchase history of logged-in user
 */
router.get('/purchase-history',function(req, res, next){

  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";

  if(req.session.username != null){

    json_res.data = [];

      connect.get(app_config.name).inst.getLogCount(
        req.session.username,
        {from: app_config.acc_address},
        function(err1, result1){
        if(!err1){
          let token_count = parseInt(result1.toString()); // BigNumber
          json_res.success = true;

          let log_proms = [];

          let logListFlag = true;
          for(let index = 0 ; index < token_count && logListFlag; index++){
            log_proms.push(
              new Promise(function(resolve){
                connect.get(app_config.name).inst.getLog(
                  req.session.username,
                  index,
                  {from: app_config.acc_address},
                  function(err2, result2)
                  {
                  if(!err2){
                    json_res.data.push(result2.split("\u232c"));
                  }else{
                    if(index == 0){
                      logListFlag = false;
                      json_res.success = false;
                    }
                  }
                  resolve();
                });
              }));
          }
          (async ()=> {
            await Promise.all(log_proms);
            res.json(json_res);
          })();
        }
      });
  }else{
    json_res.msg = "Unauthorised";
    res.status(401).json(json_res);
  }
});

module.exports = router;
