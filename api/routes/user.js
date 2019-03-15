let express = require('express');
let router = express.Router();

var keythereum = require("keythereum");

let web3_helper = require('web3-helper');

let connect = require('../network/connect.js');

router.post('/', function(req, res, next) {
  if(req.session.username != null || req.session.user_account != null){
    res.redirect("../logout");
  }else{
    connect.contAnarik.verifyCredential(req.body.s_username,req.body.s_password, {gas: "500000"}, function(err,result){
      if(result){
        res.render('error',{message:'User already exists'});
      }else{

        var params = { keyBytes: 32, ivBytes: 16 };
        var dk = keythereum.create(params);
        let userAccAddr = keythereum.privateKeyToAddress(dk.privateKey);

        if(userAccAddr){

          connect.contAnarik.addUser(
            req.body.s_username,
            userAccAddr,
            req.body.s_password,
            {gas: 200000},
            function(err2,result2){

              if(!err2){
                res.redirect("../logout");

              }else{
                res.render('error',{message:'User account creation failed'});
              }
            });
        }else{
            res.render('error',{message:"User account creation failed"});
        }
      }
    });
  }
});

/** Buy tokens
  */
router.post('/req-tokens',function(req, res, next){
  let json_res = new Object();
  json_res.success = false;
  json_res.message = "NA";

  if(req.session.user_account != null){
    if(req.body.token_count != null){
      if(!isNaN(req.body.token_count)){

        let atrGas = parseInt(connect.contSnail.addTokenRequest.estimateGas(
          req.session.username,
          req.session.user_account,
          req.body.token_count,
          {from: connect.contSnailAccAddr}
        ));

        let gasLimit = atrGas + atrGas*0.3;

        web3_helper.sendRawTransaction(
          connect.web3_pub,
          connect.pub_privateKey,
          connect.contSnailAccAddr,
          null,
          gasLimit,
          connect.contSnailAccAddr,
          connect.pub_config.c_address,
          connect.contSnail.addTokenRequest.getData(
            req.session.username,
            req.session.user_account,
            req.body.token_count
          )
        ).then(receipt => {

          json_res.success = true;
          json_res.message = "Token requested successfully";
          res.json(json_res);

        }).catch(error => {

          res.status(500);
          json_res.message = "Add token request failed";
          res.json(json_res);
        });

        }else{
          json_res.message = "Invalid token count";
          res.status(400).json(json_res);
        }
      }else{
        json_res.message = "Invalid input token count";
        res.status(400).json(json_res);
      }
    }else{
      json_res.message = "Invalid account address";
      res.status(401).json(json_res);
    }
  });

/**
* get purchase history of logged-in user
*/
router.get('/purchase-history',function(req, res, next){

  let json_res = new Object();
  json_res.success = false;
  json_res.message = "NA";

  if(req.session.username != null){

    json_res.data = [];

      connect.contAnarik.getLogCount(req.session.username,function(err1,result1){
        if(!err1){
          let token_count = parseInt(result1.toString()); // BigNumber
          json_res.success = true;

          let log_proms = [];

          let logListFlag = true;
          for(let index = 0 ; index < token_count && logListFlag; index++){
            log_proms.push(
              new Promise(function(resolve){
                connect.contAnarik.getLog(req.session.username, index,function(err2,result2){
                  if(!err2){
                    json_res.data.push(result2.split("\u232c")); // todo: change format
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
    json_res.message = "Unauthorised";
    res.status(401).json(json_res);
  }
});

module.exports = router;
