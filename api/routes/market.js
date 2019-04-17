let express = require('express');
let router = express.Router();
let path = require('path');

let web3_helper = require('web3-helper');

const connect = require(path.join(__dirname,'..', 'network', 'connect.js'));
const appConfig = require(path.join(__dirname, '..', 'network', 'config', 'app.js'));
const tknConfig = require(path.join(__dirname, '..', 'network', 'config', 'token.js'));

/** Market Details */
router.get('/', (req, res, next) =>  {
  if(req.session.username != null){
    let jsonRes = new Object();
    jsonRes.success = false;
    jsonRes.status = "success";
    jsonRes.data = [];

    // Get total number of items in the market
    connect.get(appConfig.name).inst.getItemCount(
      {from: appConfig.acc_address},
      (err, result) => {
      if(!err){
        let item_count = parseInt(result.toString());

        let prom_items = [];

        for(let index=0; index < item_count; index++){

          prom_items.push(
            new Promise(function(resolve){
              connect.get(appConfig.name).inst.getPublicMarketItem(
                index,
                req.session.username,
                {from: appConfig.acc_address},
                (err1, result1) =>  {
                  if(!err1){
                    jsonRes.data.push({
                      "id" : index,
                      "name" : result1[0],
                      "description" : result1[1],
                      "price" : result1[2],
                      "owner" : connect.get(appConfig.name).web3.toUtf8(result1[3])
                    });
                  }
                  resolve();
                });
            }));
        }

        (async () =>{
          await Promise.all(prom_items);
          jsonRes.success = true;
          res.json(jsonRes);
        })();
      }
    });
  }else{
    jsonRes.msg = "Unauthorised";
    res.status(401).json(jsonRes);
  }
});

/**
 * Buy an item from the market
 */
router.post('/buy-item',(req, res, next) => {
  let jsonRes = new Object();
  jsonRes.success = false;
  jsonRes.msg = "NA";

  if(req.session.username != null && req.session.user_account != null){
    let item_index = req.body.index;

    //Get items's essential details
    connect.get(appConfig.name).inst.getItem(
      item_index,
      {from: appConfig.acc_address},
      (err1, result1) => {
      if(!err1){
        // check if buyer has sufficient balance
        connect.get(tknConfig.name).inst.balanceOf(
          req.session.user_account,
          {from: tknConfig.acc_address},
          (err2, result2) =>  {

          if(!err2){
            // if item price <= balance of user
            let item_price = parseInt(result1[4].toString());
            if(item_price <= parseInt(result2.toString())){

              let seller_name = result1[1];
              let buyer_addr = req.session.user_account;
              let seller_addr = result1[0];

                // Send tokens
                let gasLimit = parseInt(connect.get(tknConfig.name).inst.sendTokens.estimateGas(
                  seller_addr,
                  buyer_addr,
                  item_price,
                  {from: tknConfig.acc_address}
                ));

                gasLimit = Math.round(gasLimit + gasLimit*0.5);

                web3_helper.sendRawTransaction(
                  connect.get(tknConfig.name).web3,
                  tknConfig.acc_pri_k,
                  tknConfig.acc_address,
                  null,
                  gasLimit,
                  tknConfig.acc_address,
                  connect.get(tknConfig.name).inst.address,
                  connect.get(tknConfig.name).inst.sendTokens.getData(
                    buyer_addr,
                    seller_addr,
                    item_price
                  )
                )
                .then(receipt => {

                  let buyer_log = "P\u232c"+seller_name+"\u232c"+result1[2]+"\u232c"+result1[3]+"\u232c"+result1[4].toString();
                  let seller_log = "S\u232c"+req.session.username+"\u232c"+result1[2]+"\u232c"+result1[3]+"\u232c"+result1[4].toString();

                  let gasEstimate = connect.get(appConfig.name).inst.changeOwner.estimateGas(
                    buyer_addr,
                    buyer_log,
                    seller_addr,
                    seller_log,
                    item_index
                  );

                  web3_helper.sendRawTransaction(
                    connect.get(appConfig.name).web3,
                    appConfig.acc_pri_k,
                    appConfig.acc_address,
                    null,
                    gasEstimate,
                    appConfig.acc_address,
                    connect.get(appConfig.name).inst.address,
                    connect.get(appConfig.name).inst.sendTokens.changeOwner(
                      buyer_addr,
                      buyer_log,
                      seller_addr,
                      seller_log,
                      item_index
                    )
                  )
                  .then( receipt => {
                    jsonRes.success = true;
                    jsonRes.msg = "Market item transacted successfully";
                  })
                  .catch ( e => {
                    jsonRes.msg = "Change ownership failed";
                    res.status(500);
                  })
                  .finally( () => {
                    res.json(jsonRes);
                  });

                })
                .catch(error => {
                  jsonRes.msg = "Market item transaction failed";
                  res.status(500).json(jsonRes);
                });
              }else{
                  jsonRes.msg = "Insufficient balance";
                  res.status(400).json(jsonRes);
              }
              }else{
                jsonRes.msg = "Invalid user address";
                res.status(400).json(jsonRes);
              }
            });
      }else{
        jsonRes.msg = "Unable to retrieve item details";
        res.status(400).json(jsonRes);
      }
    });
  }else{
    jsonRes.msg = "Unauthorised";
    res.status(401).json(jsonRes);
  }
});

module.exports = router;
