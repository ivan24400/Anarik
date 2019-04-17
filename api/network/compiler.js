let solc = require('solc');
let fs = require('fs');
let path = require('path');

const contAppBasePath = path.join(__dirname,'..','contracts','app');
const contTokenBasePath = path.join(__dirname,'..','contracts','token');

const DEFAULT_GAS_LIMIT = 5000000;

/**
 * Import reference function for App contracts
 * @param filePath import file path
 * @return file content
 */
function findAppSolImports(filePath){
  let content = null;
  if(filePath === 'user/User.sol'){
    content = { contents: fs.readFileSync(path.join(contAppBasePath,'market','user','User.sol'),'utf8') };
  } else if(filePath === 'UserIntf.sol' || filePath === 'user/UserIntf.sol'){
    content = { contents: fs.readFileSync(path.join(contAppBasePath,'market','user','UserIntf.sol'),'utf8') };
  } else if(filePath === 'StringUtil.sol' || filePath === 'util/StringUtil.sol'){
    content = { contents: fs.readFileSync(path.join(contAppBasePath,'util','StringUtil.sol'),'utf8') };
  } else {
    content = {error:'File not found'};
  }
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
      }
    },
    settings: {
  		outputSelection: {
  			'*': {
  				'*': [ '*' ]
  			}
  		}
  	}
  };

  let output = JSON.parse(solc.compile(JSON.stringify(input), findAppSolImports));
  return output.contracts;
}


/** Compile User's solidity files */
function compileUser() {
  console.log('Compiling User contracts ==========');

  var input = {
    language: 'Solidity',
    sources: {
      'User':{
        content: fs.readFileSync(path.join(contAppBasePath,'market','user','User.sol'),'utf8')
      }
    },
    settings: {
  		outputSelection: {
  			'*': {
  				'*': [ '*' ]
  			}
  		}
  	}
  };

  let output = JSON.parse(solc.compile(JSON.stringify(input), findAppSolImports));
  return output.contracts;
}

/**
 * Import reference function for Token contracts
 * @param filePath import file path
 * @return file content
 */
function findTokenSolImports(filePath){
  let content = null;
  if(filePath === 'SafeMath.sol' || filePath === 'math/SafeMath.sol'){
    content = { contents: fs.readFileSync(path.join(contTokenBasePath,'math','SafeMath.sol'),'utf8') };
  } else if(filePath === 'ERC20/ERC20.sol'){
    content = { contents: fs.readFileSync(path.join(contTokenBasePath,'token','ERC20','ERC20.sol'),'utf8') };
  } else if(filePath === 'ERC20/ERC20Intf.sol'){
    content = { contents: fs.readFileSync(path.join(contTokenBasePath,'token','ERC20','ERC20Intf.sol'),'utf8') };
  } else {
    content = {error: 'File not found'};
  }
  return content;
}

/** Compile token contracts */
function compileToken(){
  console.log("Compiling token contracts ==========");

  var input = {
    language : 'Solidity',
    sources : {
      'Snail': {
        content: fs.readFileSync(path.join(contTokenBasePath,'token','Snail.sol'),'utf8')
      }
    },
    settings:{
      outputSelection: {
        '*':{
          '*':[ '*' ]
        }
      }
    }
  }

  let output = JSON.parse(solc.compile(JSON.stringify(input), findTokenSolImports));
  return output.contracts;
}

module.exports = {
  defaultGasLimit: parseInt(DEFAULT_GAS_LIMIT).toString(16),
  compileApp: compileApp,
  compileUser: compileUser,
  compileToken: compileToken
};
