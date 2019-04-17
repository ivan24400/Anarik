let express = require('express');
let router = express.Router();
let path = require('path');
let keythereum = require("keythereum");

let web3_helper = require('web3-helper');

const connect = require(path.join(__dirname, '..', '..', 'network', 'connect.js'));
const appConfig = require(path.join(__dirname, '..', '..', 'network', 'config', 'app.js'));
const userConfig = require(path.join(__dirname, '..', '..', 'network', 'config', 'user.js'));
const tknConfig = require(path.join(__dirname, '..', '..', 'network', 'config', 'token.js'));

/** Add new user */
router.post('/', (req, res, next) =>  {
  let jsonRes = new Object();
  jsonRes.success = false;
  jsonRes.msg = "NA";

  if(req.session.username != null){
    res.redirect(307,"../logout");
  } else if (req.body.s_username.length > 32) {
    jsonRes.msg = "Username should be not more than 32 characters";
    res.json(jsonRes);
  } else {
    try{
      connect.get(userConfig.name).inst.verifyCredential(
        connect.get(userConfig.name).web3.fromAscii(req.body.s_username),
        req.body.s_password,
        {from: userConfig.acc_address, gas: userConfig.DEFAULT_GAS},
        (err, result) => 
        {
          if(!err || result){
            jsonRes.msg = 'User already exists';
            res.json(jsonRes);
          } else {

            let userAccAddr = web3_helper.getRandomAddress();

            if(userAccAddr) {
              let gasEstimate = connect.get(userConfig.name).inst.addUser.estimateGas(
                req.body.s_username,
                userAccAddr,
                req.body.s_password
              );

              gasEstimate = Math.round(gasEstimate + gasEstimate*0.5);

              web3_helper.sendRawTransaction(
                connect.get(userConfig.name).web3,
                userConfig.acc_pri_k,
                userConfig.acc_address,
                null,
                gasEstimate,
                userConfig.acc_address,
                connect.get(userConfig.name).inst.address,
                connect.get(userConfig.name).inst.addUser.getData(
                  req.body.s_username,
                  userAccAddr,
                  req.body.s_password
                )
              )
              .then(receipt => {
                jsonRes.success = true;
                jsonRes.msg = "User created successfully";
              })
              .catch(e => {
                jsonRes.msg = 'User account creation failed';
                res.status(500);
              })
              .finally(() => {
                res.json(jsonRes);
              });

          } else {
                jsonRes.msg = "User account creation failed";
                res.status(500).json(jsonRes);
            }
          }
      });
    } catch(e) {
      jsonRes.msg = "Operation failed"
      res.json(jsonRes);
    }
  }
});

/** Update user profile */
router.put('/', (req, res, next) =>  {
  let jsonRes = new Object();
  jsonRes.success = false;
  jsonRes.msg = "NA";

  if(req.session.username != null){
    res.redirect(307,"../logout");
  } else if (req.body.username.length > 32) {
    jsonRes.msg = "Username should be not more than 32 characters";
    res.json(jsonRes);
  } else {
    try{
      let gasEstimate = connect.get(userConfig.name).inst.updatePasswd.estimateGas(
        req.body.username,
        req.body.oldPassword,
        req.body.newPassword
      );

      gasEstimate = Math.round(gasEstimate + gasEstimate*0.5);

      web3_helper.sendRawTransaction(
        connect.get(userConfig.name).web3,
        userConfig.acc_pri_k,
        userConfig.acc_address,
        null,
        gasEstimate,
        userConfig.acc_address,
        connect.get(userConfig.name).inst.address,
        connect.get(userConfig.name).inst.addUser.updatePasswd(
          req.body.username,
          req.body.oldPassword,
          req.body.newPassword
        )
      )
      .then(receipt => {
        jsonRes.success = true;
        jsonRes.msg = "User created successfully";
      })
      .catch(e => {
        jsonRes.msg = 'User account creation failed';
        res.status(500);
      })
      .finally(() => {
        res.json(jsonRes);
      });

    } catch(e) {
      jsonRes.msg = "Operation failed"
      res.json(jsonRes);
    }
  }
});

/** Remove an user */
router.delete('/', (req, res, next) =>  {
  let jsonRes = new Object();
  jsonRes.success = false;
  jsonRes.msg = "NA";

  if(req.session.username != null){
    res.redirect(307,"../logout");
  } else if (req.body.username.length > 32) {
    jsonRes.msg = "Username should be not more than 32 characters";
    res.json(jsonRes);
  } else {
    try{
        let gasEstimate = connect.get(userConfig.name).inst.removeUser.estimateGas(
          req.body.username,
          req.body.password
        );

        gasEstimate = Math.round(gasEstimate + gasEstimate*0.5);

        web3_helper.sendRawTransaction(
          connect.get(userConfig.name).web3,
          userConfig.acc_pri_k,
          userConfig.acc_address,
          null,
          gasEstimate,
          userConfig.acc_address,
          connect.get(userConfig.name).inst.address,
          connect.get(userConfig.name).inst.addUser.removeUser(
            req.body.username,
            req.body.password
          )
        )
        .then(receipt => {
          jsonRes.success = true;
          jsonRes.msg = "User created successfully";
        })
        .catch(e => {
          jsonRes.msg = 'User account creation failed';
          res.status(500);
        })
        .finally(() => {
          res.json(jsonRes);
        });
    } catch(e) {
      jsonRes.msg = "Operation failed"
      res.json(jsonRes);
    }
  }
});

/** Import user actions */
router.use('/user', require('./actions.js'));

module.exports = router;
