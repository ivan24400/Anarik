var express = require('express');
var router = express.Router();
let path = require('path');
let connect = require(path.join(__dirname,'..', 'network', 'connect.js'));

let app_config = require(path.join(__dirname, '..', 'network', 'config', 'app.js'));
let tkn_config = require(path.join(__dirname, '..', 'network', 'config', 'token.js'));

/** Api home */
router.get('/', function(req, res) {
  res.json({msg:'Anarik API v1'});
});

/** Authorize/Login a user */
router.post('/login', function(req, res, next) {
  let json_res = new Object();
  json_res.success = false;
  json_res.msg = "NA";

  // Admin user
  if(
    req.body.l_username == connect._admin &&
    req.body.l_password == connect._admin_pass
  ){
    req.session.username = req.body.l_username;
    req.session.password = req.body.l_password;

    // Get total number of users
    connect.get(app_config.name).inst.getUserCount(
      {from: app_config.acc_address},
      function(err1, result1){
      if(!err1){
        let total_users = parseInt(result1.toString());
        let user_arr = [];
        let user_arr_proms = [];

        for(let _index = 0; _index < total_users; _index++){
          user_arr_proms.push(
            new Promise(function(resolve){
              //Get username
              connect.get(app_config.name).inst.getUserNameAt(
                _index,
                {from: app_config.acc_address},
                function(err2, result2){
                if(!err2){
                  user_arr.push(result2);
                }else{
                  json_res.msg = "User retrieval failed";
                  res.status(401).json(json_res);
                }
              });
            }));
        }

        (async ()=>{
          await Promise.all(user_arr_proms);
        })();

        if(user_arr){
            //Get total tokens owned by the admin
            connect.get(tkn_config.name).inst.balanceOf(
              tkn_config.acc_address,
              {from: tkn_config.acc_address},
              function(err4, result4){
              if(!err4){

                let requests_arr = [];
                //Get token request
                connect.get(tkn_config.name).inst.getTokenRequestCount(
                  {from: tkn_config.acc_address},
                  function(err5,result5){
                  if(!err5){
                    const total_requests = parseInt(result5.toString());

                    let promise_arr = [];

                    //Get each request
                    for(let i=0; i<total_requests; i++){
                      const index = i;
                      promise_arr.push(
                        new Promise(function(resolve){
                          connect.get(tkn_config.name).inst.getTokensDetailsAt(
                            index,
                            {from: tkn_config.acc_address},
                            function(err6, result6){
                            if(!err6){
                              requests_arr.push({
                                index:index,
                                name:result6[0],
                                address:result6[1],
                                value:result6[2]
                              });
                            }
                            resolve();
                          });
                        })
                      );
                    }
                    (async () => {
                      await Promise.all(promise_arr);
                      let req_addr = new Set([]);
                      requests_arr = requests_arr.filter(
                        (item, index, arr) => {
                           if(req_addr.has(item.address)){
                              return false;
                            } else {
                              req_addr.add(item.address);
                              return true;
                            }
                        });
                      json_res.success = true;
                      json_res.username = connect._admin;
                      json_res.snails = result4.toString();
                      json_res.users = user_arr,
                      json_res.token_requests = requests_arr;
                      res.json(json_res);
                    })();
                  }
                });
              }else{
                json_res.msg = "User account balance retrieval failed";
                res.status(500).json(json_res);
              }
            });
        }
      }else{
        json_res = "Unable to access user's list";
        res.status(401).json(json_res);
      }
    });

  }else{
    /** Normal user login */
    try{
      connect.get(app_config.name).inst.verifyCredential(
        req.body.l_username,
        req.body.l_password,
        {from: app_config.acc_address},
        function(err,result){

        if(result){
          connect.get(app_config.name).inst.getUserAccAddr(
            req.body.l_username,
            {from: app_config.acc_address, gas: 200000},
            function(err2,result2){
            if(!err2){
              //Get total tokens owned by the user
              connect.get(tkn_config.name).inst.balanceOf(
                result2,
                {from: tkn_config.acc_address},
                function(err3,result3){
                if(!err3){
                  req.session.username = req.body.l_username;
                  req.session.password = req.body.l_password;
                  req.session.user_account = result2;

                  json_res.success = true;
                  json_res.username = req.body.l_username;
                  json_res.snails = parseInt(result3.toString(10));

                  res.json(json_res);
                }else{
                  json_res.msg = "User account balance retrieval failed";
                  res.status(500).json(json_res);
                }
              });
            }else{
              json_res.msg = "User account address retrieval failed";
              res.status(500).json(json_res);
            }
          });
        }else {
          json_res.msg = "Invalid credentials";
          res.status(401).json(json_res);
        }
      });
    }catch{
      json_res.msg = "Something failed"
      res.status(500).json(json_res);
    }
  }
});

/** Logout the user */
router.get('/logout',function(req,res,next){
  req.session.destroy(function(err) {
    if(err) req.session = null;
    res.redirect('/');
  });
});

module.exports = router;
