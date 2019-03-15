let express = require('express');
let router = express.Router();

let web3_helper = require('web3-helper');

let connect = require('../network/connect.js');

router.post('/send-tokens',function(req,res,next){
  let json_res = new Object();
  json_res.success = false;
  json_res.message = "NA";
  if(
    req.body.token_recvr != null &&
    req.body.token_count != null &&
    req.session.username === connect._admin
  ){
    if(req.body.token_count > 0){
      connect.contAnarik.getUserAccAddr(req.body.token_recvr, function(err1,result1){
        if(!err1){

          let dtGas = parseInt(connect.contSnail.donateTokens.estimateGas(
            result1,
            req.body.token_count,
            {from: connect.contSnailAccAddr}
          ));

          let gasLimit = dtGas + dtGas*0.3;
          web3_helper.sendRawTransaction(
            connect.web3_pub,
            connect.pub_privateKey,
            connect.contSnailAccAddr,
            null,
            gasLimit,
            connect.contSnailAccAddr,
            connect.pub_config.c_address,
            connect.contSnail.donateTokens.getData(result1, req.body.token_count)
          ).then(receipt => {
            json_res.success = true;
            json_res.message = "Token transferred successfully";
            res.json(json_res);

          }).catch(error => {
            json_res.message = "Token transfer failed";
            res.status(401).send(json_res);
          });

        }else{
          json_res.message = "Unable to retrieve user's account";
          res.status(401).send(json_res);
        }
      });
    }
  }else{
    json_res.message = "Unauthorised";
    res.status(401).send(json_res);
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
      {from: connect.contSnailAccAddr}
    ));

    let gasLimit = akGas + akGas*0.3;
    web3_helper.sendRawTransaction(
      connect.web3_pub,
      connect.pub_privateKey,
      connect.contSnailAccAddr,
      null,
      gasLimit,
      connect.contSnailAccAddr,
      connect.pub_config.c_address,
      connect.contSnail.ackRequestAt.getData(req.body.token_requestor_index)
    ).then(receipt => {
      json_res.success = true;
      json_res.message = "Token request acknowledged successfully";
      res.json(json_res);

    }).catch(error => {
      res.status(400).json({message: "Invalid address. Request acknowledgement failed"});
    });
  }else{
    json_res.message = "Unauthorised";
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

    let rjrGas = parseInt(connect.contSnail.rejectRequestAt.estimateGas(
      req.body.token_requestor_index,
      {from: connect.contSnailAccAddr}
    ));

    let gasLimit = rjrGas + rjrGas*0.3;

    web3_helper.sendRawTransaction(
      connect.web3_pub,
      connect.pub_privateKey,
      connect.contSnailAccAddr,
      null,
      gasLimit,
      connect.contSnailAccAddr,
      connect.pub_config.c_address,
      connect.contSnail.rejectRequestAt.getData(req.body.token_requestor_index)
    ).then(receipt => {
      json_res.sucess = true;
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
