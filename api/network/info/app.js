{
    "c_address": "0x5c7e894ac3d2DcA82cf4fA8400359f0e015B3f59",
    "c_abi": [
      {
        "constant": true,
        "inputs": [
          {
            "name": "_username",
            "type": "string"
          },
          {
            "name": "_password",
            "type": "string"
          }
        ],
        "name": "verifyCredential",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x1230abb5"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_index",
            "type": "uint256"
          }
        ],
        "name": "getUserNameAt",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x231fc5a0"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_username",
            "type": "string"
          }
        ],
        "name": "getLogCount",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x45d30723"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_addr",
            "type": "address"
          }
        ],
        "name": "getUserNameFromAcc",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x5815b4f3"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_username",
            "type": "string"
          },
          {
            "name": "_info",
            "type": "string"
          }
        ],
        "name": "addLog",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xa273079a"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getUserCount",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xb5cb15f7"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_username",
            "type": "string"
          }
        ],
        "name": "getUserAccAddr",
        "outputs": [
          {
            "name": "",
            "type": "address"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xbaa0d8a3"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_username",
            "type": "string"
          }
        ],
        "name": "getUserPassword",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xc9ae6b01"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_username",
            "type": "string"
          },
          {
            "name": "_account",
            "type": "address"
          },
          {
            "name": "_password",
            "type": "string"
          }
        ],
        "name": "addUser",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xd4b31731"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_username",
            "type": "string"
          },
          {
            "name": "_index",
            "type": "uint256"
          }
        ],
        "name": "getLog",
        "outputs": [
          {
            "name": "",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0xedd717dc"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_username",
            "type": "string"
          },
          {
            "name": "_password",
            "type": "string"
          }
        ],
        "name": "removeUser",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xf6996a94"
      },
      {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "name": "_addr",
            "type": "address"
          },
          {
            "indexed": false,
            "name": "_user",
            "type": "string"
          }
        ],
        "name": "UserEvent",
        "type": "event",
        "signature": "0x14fc61319c09e03957575f97f7ad927864cc7c525fde1077871629f8b488737a"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_name",
            "type": "string"
          },
          {
            "name": "_description",
            "type": "string"
          },
          {
            "name": "_price",
            "type": "uint256"
          },
          {
            "name": "_owner",
            "type": "address"
          }
        ],
        "name": "createItem",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xcec95df7"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_name",
            "type": "string"
          },
          {
            "name": "_description",
            "type": "string"
          },
          {
            "name": "_price",
            "type": "uint256"
          },
          {
            "name": "_available",
            "type": "bool"
          },
          {
            "name": "_index",
            "type": "uint256"
          },
          {
            "name": "_username",
            "type": "string"
          },
          {
            "name": "_password",
            "type": "string"
          }
        ],
        "name": "updateItem",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x54a6e158"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_index",
            "type": "uint256"
          }
        ],
        "name": "deleteItem",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0x654fc833"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_buyer",
            "type": "address"
          },
          {
            "name": "_buyer_log",
            "type": "string"
          },
          {
            "name": "_seller",
            "type": "address"
          },
          {
            "name": "_seller_log",
            "type": "string"
          },
          {
            "name": "_index",
            "type": "uint256"
          }
        ],
        "name": "changeOwner",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function",
        "signature": "0xb622a497"
      },
      {
        "constant": true,
        "inputs": [],
        "name": "getItemCount",
        "outputs": [
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x7749cf23"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_ownername",
            "type": "string"
          },
          {
            "name": "_index",
            "type": "uint256"
          }
        ],
        "name": "getUserStoreItem",
        "outputs": [
          {
            "name": "",
            "type": "bool"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x848b1548"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_index",
            "type": "uint256"
          },
          {
            "name": "_username",
            "type": "string"
          }
        ],
        "name": "getPublicMarketItem",
        "outputs": [
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "uint256"
          },
          {
            "name": "owner",
            "type": "string"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x47aff2d4"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_index",
            "type": "uint256"
          }
        ],
        "name": "getItem",
        "outputs": [
          {
            "name": "",
            "type": "address"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "string"
          },
          {
            "name": "",
            "type": "uint256"
          }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function",
        "signature": "0x3129e773"
      }
    ]
}
