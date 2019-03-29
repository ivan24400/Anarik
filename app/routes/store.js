let express = require('express');
let router = express.Router();
let path = require('path');

let connect = require(path.join(__dirname,'..', 'network', 'connect.js'));
let app_config = require(path.join(__dirname, '..', 'network', 'config', 'app.js'));
let tkn_config = require(path.join(__dirname, '..', 'network', 'config', 'token.js'));

/** Get user store details */
router.get('/',function(req,res,next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";

  if(req.session.user_account != null){

    connect.get(app_config.name).inst.getItemCount(function(err1,result1){
      if(!err1){
        let item_count = parseInt(result1.toString());
        json_res.success = true;
        json_res.data = [];

        let callback_resolve_index = 0;

        let callback_resolve = function(){
          callback_resolve_index++;
          if(callback_resolve_index == item_count){
            json_res.success = true;
            res.json(json_res);
          }
        }
          let itemListFlag = true;
          for(let index = 0; index < item_count && itemListFlag; index++){

                connect.get(app_config.name).inst.getUserStoreItem(
                  req.session.username,
                  index,
                  function(err2,result2)
                  {
                    if(!err2){
                      json_res.data.push({
                        "sale":result2[0],
                        "index":index,
                        "name":result2[1],
                        "description":result2[2],
                        "price":result2[3].toString()
                      });

                    }else{
                      if(index == 0){
                        itemListFlag = false;
                      }
                    }
                    callback_resolve();
                });
          }
      }else{
        json_res.msg = "Failed to retrieve a user item count";
        res.status(500).json(json_res);
      }
    });

  }else{
    json_res.msg = "Unauthorised";
    res.status(401).json(json_res);
  }
});

/** Add an item in the user store  */
router.post('/item',function(req, res, next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";

  if(req.session.user_account != null){
    let gasEstimate = connect.get(app_config.name).inst.createItem.estimateGas(
    req.body.product_name,
    req.body.product_desc,
    req.body.product_price,
    req.session.user_account
  );
  gasEstimate = Math.round(gasEstimate + gasEstimate*0.4);
    connect.get(app_config.name).inst.createItem(
      req.body.product_name,
      req.body.product_desc,
      req.body.product_price,
      req.session.user_account,
      {gas: gasEstimate},
      function(err, result)
      {
        if(err){
          console.log(err);
          json_res.msg = "Unable to add item";
          res.status(500).json(json_res);
        }else{
          json_res.success = true;
          res.json(json_res);
        }
      });
    }else{
      json_res.msg = "Unauthorised";
      res.status(401).json(json_res);
    }
});

/** Update an item in the user's store */
router.put('/item', function(req,res,next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";

  if(req.session.username != null){

    connect.get(app_config.name).inst.updateItem(
      req.body.product_name,
      req.body.product_desc,
      req.body.product_price,
      req.body.product_sale,
      req.body.product_index,
      req.session.username,
      req.session.password,
      function(err, result1)
      {
        if(err){
          json_res.msg = "Unable to update item";
          res.status(500).json(json_res);
        }else{
          json_res.success = true;
          json_res.msg = "Updated item successfully";
          res.json(json_res);
        }
      });
    }else{
      res;
      json_res.msg = "Unauthorised";
      res.status(401).json(json_res);
    }
});

/** Delete an item from the store  */
router.delete('/item',function(req,res,next){
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";

  if(req.session.username != null){

    let gasEstimate = connect.get(app_config.name).inst.deleteItem.estimateGas(
      req.body.product_index);
    gasEstimate = Math.round(gasEstimate + gasEstimate*0.4);

    connect.get(app_config.name).inst.deleteItem(
      req.body.product_index,
      {gas: gasEstimate},
      function(err,result)
      {
        if(!err){
          json_res.success = true;
          json_res.msg = "Deleted successfully";
          res.json(json_res);
        }else{
          json_res.msg = "Deletion failed";
          res.status(400).json(json_res);
        }
      });

  }else{
    json_res.msg = "Unauthorised";
    res.status(401).json(json_res);
  }
});

module.exports = router;
