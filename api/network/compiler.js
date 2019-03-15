var solc = require('solc');
var fs = require('fs');
var path = require('path');

const contAppBasePath = path.join(__dirname,'..','contracts','app');
const contTokenBasePath = path.join(__dirname,'..','contracts','token');

/**
 * Import reference function for App contracts
 * @param filePath import file path
 * @return file content
 */
function findAppSolImports(filePath){
  let content = null;
  if(filePath === 'User.sol'){
    content = { content:fs.readFileSync(path.join(contAppBasePath,'market','user','User.sol'),'utf8') };
  } else if(filePath === 'UserIntf.sol'){
    content = { content:fs.readFileSync(path.join(contAppBasePath,'market','user','UserIntf.sol'),'utf8') };
  } else if(filePath === 'StringUtil.sol'){
    content = { content:fs.readFileSync(path.join(contAppBasePath,'util','StringUtil.sol'),'utf8') };
  } else {
    content = {error:'File not found'};
  }
  console.log(content);
  return content;
}

/** Compile App's solidity files */
function compileApp(){
  console.log('Compiling App contracts ==========');

  var input = {
    language: 'Solidity',
    sources: {
      'Anarik':{
        content: fs.readFileSync(path.join(contAppBasePath,'market','Anarik.sol'),'utf8')
      },
      'User.sol':{
        content : fs.readFileSync(path.join(contAppBasePath,'market','user','User.sol'),'utf8')
      },
      'UserIntf.sol':{
        content : fs.readFileSync(path.join(contAppBasePath,'market','user','UserIntf.sol'),'utf8')
      },
      'StringUtil.sol':{
        content : fs.readFileSync(path.join(contAppBasePath,'util','StringUtil.sol'),'utf8')
      },
    },
    settings: {
  		outputSelection: {
  			'*': {
  				'*': [ '*' ]
  			}
  		}
  	}
  };

  var output = JSON.parse(solc.compile(JSON.stringify(input),findAppSolImports));
  console.log(output);
  return output.contracts;
}

/**
 * Import reference function for Token contracts
 * @param filePath import file path
 * @return file content
 */
function findTokenSolImports(filePath){
  let content = null;
  if(filePath === 'SafeMath.sol'){
    content = { content:fs.readFileSync(path.join(contTokenBasePath,'math','SafeMath.sol'),'utf8') };
  } else if(filePath === 'ERC20.sol'){
    content = { content:fs.readFileSync(path.join(contTokenBasePath,'token','ERC20','ERC20.sol'),'utf8') };
  } else if(filePath === 'ERC20Interface.sol'){
    content = { content:fs.readFileSync(path.join(contTokenBasePath,'token','ERC20','ERC20Interface.sol'),'utf8') };
  } else {
    content = {error:'File not found'};
  }
  console.log(content);
  return content;
}

/** Compile token contracts */
function compileToken(){
  console.log("Compiling token contracts ==========");

  var input = {
    language : 'Solidity',
    sources : {
      'Snail': {
        content : fs.readfileSync(path.join(contTokenBasePath,'token','Snail.sol'),'utf8')
      },
      'SafeMath': {
        content : fs.readfileSync(path.join(contTokenBasePath,'math','SafeMath.sol'),'utf8')
      },
      'ERC20': {
        content : fs.readfileSync(path.join(contTokenBasePath,'token','ERC20','ERC20.sol'),'utf8')
      },
      'ERC20Interface': {
        content : fs.readfileSync(path.join(contTokenBasePath,'token','ERC20','ERC20Interface.sol'),'utf8')
      },
    },
    settings:{
      outputSelection : {
        '*':{
          '*':[ '*' ]
        }
      }
    }
  }

  var output = JSON.parse(solc.compile(JSON.stringify(input),findTokenSolImports));
  console.log(output);
  return output.contracts;
}

module.exports = {
  compileApp: compileApp,
  compileToken: compileToken
};
