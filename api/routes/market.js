let express = require('express');
let router = express.Router();

let web3_helper = require('web3-helper');

let connect = require('../network/connect.js');

router.get('/', function(req, res, next) {
  if(req.session.username != null){
    let json_res = new Object();
    json_res.status = "success";
    json_res.data = [];
    // Get total number of items in the market
    connect.contAnarik.getItemCount(function(err,result){
      if(!err){
        let item_count = parseInt(result.toString());

        let prom_items = [];

        for(let index=0; index < item_count; index++){

          prom_items.push(
            new Promise(function(resolve){
              connect.contAnarik.getPublicMarketItem(index,req.session.username,function(err1,result1){
                if(!err1){
                  json_res.data.push({
                    "id" : index,
                    "name" : result1[0],
                    "description" : result1[1],
                    "price" : result1[2],
                    "owner" : result1[3]
                  });
                }else{
                  console.log("ERR: CONT Anarik:"); console.log(err1);
                }
                resolve();
              });
            }));
        }

        (async () =>{
          await Promise.all(prom_items);
          res.render('market',json_res);
        })();
      }
    });
  }else{
    res.status(401).render('error',{message:"Unauthorised"});
  }
});

/**
  * Buy an item from the market
  */
router.post('/buy-item',function(req,res,next){
  let json_res = new Object();
  json_res.success = false;
  json_res.message = "NA";

  if(req.session.username != null && req.session.user_account != null){
    let item_index = req.body.index;

    //Get items's essential details
    connect.contAnarik.getItem(item_index, function(err1, result1){
      if(!err1){
        // check if buyer has sufficient balance
        connect.contSnail.balanceOf(req.session.user_account,{from:connect.contSnailAccAddr},function(err2,result2){

          if(!err2){
            // if item price <= balance of user
            let item_price = parseInt(result1[4].toString());
            if(item_price <= parseInt(result2.toString())){

              let seller_name = result1[1];
              let buyer_addr = req.session.user_account;
              let seller_addr = result1[0];

                // Send tokens
                let stGas = parseInt(connect.contSnail.sendTokens.estimateGas(
                  seller_addr,
                  buyer_addr,
                  item_price,
                  {from: connect.contSnailAccAddr}
                ));

                let gasLimit = stGas + stGas*0.5;

                web3_helper.sendRawTransaction(
                  connect.web3_pub,
                  connect.pub_privateKey,
                  connect.contSnailAccAddr,
                  null,
                  gasLimit,
                  connect.contSnailAccAddr,
                  connect.pub_config.c_address,
                  connect.contSnail.sendTokens.getData(buyer_addr,seller_addr,item_price)
                ).then(receipt => {

                  let buyer_log = "P\u232c"+seller_name+"\u232c"+result1[2]+"\u232c"+result1[3]+"\u232c"+result1[4].toString();
                  let seller_log = "S\u232c"+req.session.username+"\u232c"+result1[2]+"\u232c"+result1[3]+"\u232c"+result1[4].toString();

                  connect.contAnarik.changeOwner(
                    buyer_addr,
                    buyer_log,
                    seller_addr,
                    seller_log,
                    item_index,
                    {gas: 500000},
                    function(err4,result4){

                      if(!err4){
                        json_res.success = true;
                        json_res.message = "Market item transacted successfully";
                        res.json(json_res);
                      }else{
                        json_res.message = "Change ownership failed";
                        res.status(400).json(json_res);
                      }
                    });

                }).catch(error => {
                  json_res.message = "Market item transaction failed";
                  res.status(400).json(json_res);
                });
              }else{
                  json_res.message = "Insufficient balance";
                  res.status(400).json(json_res);
              }
              }else{
                json_res.message = "Invalid user address";
                res.status(400).json(json_res);
              }
            });
      }else{
        json_res.message = "Unable to retrieve item details";
        res.status(400).json(json_res);
      }
    });
  }else{
    json_res.message = "Unauthorised";
    res.status(401).json(json_res);
  }
});

module.exports = router;
