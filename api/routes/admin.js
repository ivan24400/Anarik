let express = require('express');
let path = require('path');
let router = express.Router();

let web3_helper = require('web3-helper');

let connect = require(path.join(__dirname,'..', 'network', 'connect.js'));
let app_config = require(path.join(__dirname,'..', 'network', 'config', 'app.js'))
let tkn_config = require(path.join(__dirname,'..', 'network', 'config', 'token.js'))

/**
 * Send tokens to a given user
 */
router.post('/send-tokens',function(req,res,next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";
  if(
    req.body.token_recvr != null &&
    req.body.token_count != null &&
    req.session.username === connect._admin
  ){
    if(req.body.token_count > 0){
      connect.get(app_config.name).inst.getUserAccAddr(req.body.token_recvr, function(err1,result1){
        if(!err1){

          let dtGas;
          try{
            dtGas = connect.get(tkn_config.name).inst.donateTokens.estimateGas(
             result1,
             req.body.token_count,
             {from: tkn_config.acc_address}
           );
           dtGas = dtGas + dtGas*0.6;
          }catch{
            dtGas = connect.get(tkn_config.name).gas;
          }

          web3_helper.sendRawTransaction(
            connect.get(tkn_config.name).web3,
            tkn_config.acc_pri_k,
            tkn_config.acc_address,
            null,
            dtGas,
            tkn_config.acc_address,
            connect.get(tkn_config.name).addr,
            connect.get(tkn_config.name).inst.donateTokens.getData(result1, req.body.token_count)
          ).then(receipt => {

            json_res.success = true;
            json_res.msg = "Token transferred successfully";
            res.json(json_res);

          }).catch(error => {

            json_res.msg = "Token transfer failed";
            res.status(500).json(json_res);

          });
        }else{
          json_res.msg = "Unable to retrieve user's account";
          res.status(500).json(json_res);
        }
      });
    }
  }else{
    json_res.msg = "Unauthorised";
    res.status(401).json(json_res);
  }
});

/**
 * Acknowledge a token request
 */
router.post('/ack-req',function(req,res,next){
  let json_res = new Object();
  json_res.success = false;
  json_res.message = "NA";

  if(req.body.token_requestor_index != null && req.session.username === connect._admin){

    //Acknowledge token request
    let akGas = parseInt(contSnail.ackRequestAt.estimateGas(
      req.body.token_requestor_index,
      {from: tkn_config.acc_address}
    ));

    let gasLimit = akGas + akGas*0.3;
    web3_helper.sendRawTransaction(
      connect.get(tkn_config.name).web3,
      tkn_config.acc_pri_k,
      tkn_config.acc_address,
      null,
      gasLimit,
      tkn_config.acc_address,
      connect.get(tkn_config.name).addr,
      connect.get(tkn_config.name).inst.ackRequestAt.getData(req.body.token_requestor_index)
    ).then(receipt => {

      json_res.success = true;
      json_res.msg = "Token request acknowledged successfully";
      res.json(json_res);

    }).catch(error => {

      json_res.msg = "Invalid address. Request acknowledgement failed";
      res.status(400).json(json_res);

    });
  }else{
    json_res.msg = "Unauthorised";
    res.status(401).json(json_res);
  }
});

/** Reject a token request
  */
router.post('/reject-req',function(req,res,next){

  let json_res = new Object();
  json_res.success = false;
  json_res.message = "NA";

  if(req.body.token_requestor_index != null && req.session.username == connect._admin){

    let rjrGas = parseInt(connect.get(tkn_config.name).inst.rejectRequestAt.estimateGas(
      req.body.token_requestor_index,
      {from: tkn_config.acc_address}
    ));

    let gasLimit = rjrGas + rjrGas*0.3;

    web3_helper.sendRawTransaction(
      connect.get(tkn_config.name).web3,
      tkn_config.acc_pri_k,
      tkn_config.acc_address,
      null,
      gasLimit,
      tkn_config.acc_address,
      connect.get(tkn_config.name).addr,
      connect.get(tkn_config.name).inst.rejectRequestAt.getData(req.body.token_requestor_index)
    ).then(receipt => {

      json_res.success = true;
      json_res.message = "Token request rejected successfully";
      res.json(json_res);

    }).catch(error => {

      json_res.message = "Invalid address. Request rejection failed";
      res.status(400).json(json_res);

    });
  }else{
    json_res.message = "Unauthorised";
    res.status(401).json(json_res);
  }
});

module.exports = router;
