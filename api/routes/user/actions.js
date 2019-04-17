let express = require('express');
let router = express.Router();
let path = require('path');
let keythereum = require("keythereum");

let web3_helper = require('web3-helper');

const connect = require(path.join(__dirname,'..', '..', 'network', 'connect.js'));
const appConfig = require(path.join(__dirname, '..', '..', 'network', 'config', 'app.js'));
const userConfig = require(path.join(__dirname, '..', '..', 'network', 'config', 'user.js'));
const tknConfig = require(path.join(__dirname, '..', '..', 'network', 'config', 'token.js'));

/** Buy tokens */
router.post('/req-tokens',(req, res, next) => {

  let jsonRes = new Object();
  jsonRes.success = false;
  jsonRes.msg = "NA";

  if(req.session.username !== connect._admin && req.session.user_account != null){
    if(req.body.token_count != null){
      if(!isNaN(req.body.token_count)){

        let gasLimit = parseInt(connect.get(tknConfig.name).inst.addTokenRequest.estimateGas(
          req.session.username,
          req.session.user_account,
          req.body.token_count,
          {from: tknConfig.acc_address}
        ));

        gasLimit = Math.round(gasLimit + gasLimit*0.3);

        web3_helper.sendRawTransaction(
          connect.get(tknConfig.name).web3,
          tknConfig.acc_pri_k,
          tknConfig.acc_address,
          null,
          gasLimit,
          tknConfig.acc_address,
          connect.get(tknConfig.name).inst.address,
          connect.get(tknConfig.name).inst.addTokenRequest.getData(
            req.session.username,
            req.session.user_account,
            req.body.token_count
          )
        )
        .then(receipt => {
          jsonRes.success = true;
          jsonRes.msg = "Token requested successfully";
          res.json(jsonRes);
        })
        .catch(error => {
          jsonRes.msg = "Add token request failed";
          res.status(500).json(jsonRes);
        });

        }else{
          jsonRes.msg = "Invalid token count";
          res.status(400).json(jsonRes);
        }
      }else{
        jsonRes.msg = "Invalid input token count";
        res.status(400).json(jsonRes);
      }
    }else{
      jsonRes.msg = "Invalid account";
      res.status(401).json(jsonRes);
    }
  });

/**
 * Retreive purchase history of user
 */
router.get('/purchase-history',(req, res, next) => {

  let jsonRes = new Object();
  jsonRes.success = false;
  jsonRes.msg = "NA";

  if(req.session.username != null){

    jsonRes.data = [];

      connect.get(userConfig.name).inst.getLogCount(
        req.session.username,
        {from: userConfig.acc_address},
        (err1, result1) => {
        if(!err1){
          let token_count = parseInt(result1.toString()); // BigNumber
          jsonRes.success = true;

          let log_proms = [];

          let logListFlag = true;
          for(let index = 0 ; index < token_count && logListFlag; index++){
            log_proms.push(
              new Promise(function(resolve){
                connect.get(userConfig.name).inst.getLog(
                  req.session.username,
                  index,
                  {from: userConfig.acc_address},
                  (err2, result2) => 
                  {
                  if(!err2){
                    jsonRes.data.push(result2.split("\u232c"));
                  }else{
                    if(index == 0){
                      logListFlag = false;
                      jsonRes.success = false;
                    }
                  }
                  resolve();
                });
              }));
          }
          (async ()=> {
            await Promise.all(log_proms);
            res.json(jsonRes);
          })();
        }
      });
  }else{
    jsonRes.msg = "Unauthorised";
    res.status(401).json(jsonRes);
  }
});

module.exports = router;
