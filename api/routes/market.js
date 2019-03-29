let express = require('express');
let router = express.Router();
let path = require('path');

let web3_helper = require('web3-helper');

let connect = require(path.join(__dirname,'..', 'network', 'connect.js'));
let app_config = require(path.join(__dirname, '..', 'network', 'config', 'app.js'));
let tkn_config = require(path.join(__dirname, '..', 'network', 'config', 'token.js'));

/** Market Details */
router.get('/', function(req, res, next) {
  if(req.session.username != null){
    let json_res = new Object();
    json_res.status = "success";
    json_res.data = [];

    // Get total number of items in the market
    connect.get(app_config.name).inst.getItemCount(
      {from: app_config.acc_address},
      function(err, result){
      if(!err){
        let item_count = parseInt(result.toString());

        let prom_items = [];

        for(let index=0; index < item_count; index++){

          prom_items.push(
            new Promise(function(resolve){
              connect.get(app_config.name).inst.getPublicMarketItem(
                index,
                req.session.username,
                {from: app_config.acc_address},
                function(err1, result1)
              {
                if(!err1){
                  json_res.data.push({
                    "id" : index,
                    "name" : result1[0],
                    "description" : result1[1],
                    "price" : result1[2],
                    "owner" : result1[3]
                  });
                }
                resolve();
              });
            }));
        }

        (async () =>{
          await Promise.all(prom_items);
          json_res.success = true;
          res.json(json_res);
        })();
      }
    });
  }else{
    json_res.msg = "Unauthorised";
    res.status(401).json(json_res);
  }
});

/**
 * Buy an item from the market
 */
router.post('/buy-item',function(req,res,next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";

  if(req.session.username != null && req.session.user_account != null){
    let item_index = req.body.index;

    //Get items's essential details
    connect.get(app_config.name).inst.getItem(
      item_index,
      {from: app_config.acc_address},
      function(err1, result1){
      if(!err1){
        // check if buyer has sufficient balance
        connect.get(tkn_config.name).inst.balanceOf(
          req.session.user_account,
          {from: tkn_config.acc_address},
          function(err2, result2) {

          if(!err2){
            // if item price <= balance of user
            let item_price = parseInt(result1[4].toString());
            if(item_price <= parseInt(result2.toString())){

              let seller_name = result1[1];
              let buyer_addr = req.session.user_account;
              let seller_addr = result1[0];

                // Send tokens
                let gasLimit = parseInt(connect.get(tkn_config.name).inst.sendTokens.estimateGas(
                  seller_addr,
                  buyer_addr,
                  item_price,
                  {from: tkn_config.acc_address}
                ));

                gasLimit = Math.round(gasLimit + gasLimit*0.5);

                web3_helper.sendRawTransaction(
                  connect.get(tkn_config.name).web3,
                  tkn_config.acc_pri_k,
                  tkn_config.acc_address,
                  null,
                  gasLimit,
                  tkn_config.acc_address,
                  connect.get(tkn_config.name).inst.addr,
                  connect.get(tkn_config.name).inst.sendTokens.getData(
                    buyer_addr,
                    seller_addr,
                    item_price
                  )
                ).then(receipt => {

                  let buyer_log = "P\u232c"+seller_name+"\u232c"+result1[2]+"\u232c"+result1[3]+"\u232c"+result1[4].toString();
                  let seller_log = "S\u232c"+req.session.username+"\u232c"+result1[2]+"\u232c"+result1[3]+"\u232c"+result1[4].toString();

                  let gasEstimate = connect.get(app_config.name).inst.changeOwner.estimateGas(
                    buyer_addr,
                    buyer_log,
                    seller_addr,
                    seller_log,
                    item_index
                  );

                  web3_helper.sendRawTransaction(
                    connect.get(app_config.name).web3,
                    app_config.acc_pri_k,
                    app_config.acc_address,
                    null,
                    gasEstimate,
                    app_config.acc_address,
                    connect.get(app_config.name).inst.address,
                    connect.get(app_config.name).inst.sendTokens.changeOwner(
                      buyer_addr,
                      buyer_log,
                      seller_addr,
                      seller_log,
                      item_index
                    )
                  ).then( receipt => {
                    json_res.success = true;
                    json_res.msg = "Market item transacted successfully";
                  }).catch ( e => {
                    json_res.msg = "Change ownership failed";
                    res.status(500);
                  }).finally( () => {
                    res.json(json_res);
                  });

                }).catch(error => {
                  json_res.msg = "Market item transaction failed";
                  res.status(500).json(json_res);
                });
              }else{
                  json_res.msg = "Insufficient balance";
                  res.status(400).json(json_res);
              }
              }else{
                json_res.msg = "Invalid user address";
                res.status(400).json(json_res);
              }
            });
      }else{
        json_res.msg = "Unable to retrieve item details";
        res.status(400).json(json_res);
      }
    });
  }else{
    json_res.msg = "Unauthorised";
    res.status(401).json(json_res);
  }
});

module.exports = router;
