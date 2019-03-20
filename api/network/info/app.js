{"c_address":"0x1fcff3ab2cb1f7cff16764e63512a19688372697","c_abi":[{"constant":true,"inputs":[{"name":"_username","type":"string"},{"name":"_password","type":"string"}],"name":"verifyCredential","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getUserNameAt","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getItem","outputs":[{"name":"","type":"address"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_username","type":"string"}],"name":"getLogCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"},{"name":"_username","type":"string"}],"name":"getPublicMarketItem","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"},{"name":"owner","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"string"},{"name":"_description","type":"string"},{"name":"_price","type":"uint256"},{"name":"_available","type":"bool"},{"name":"_index","type":"uint256"},{"name":"_username","type":"string"},{"name":"_password","type":"string"}],"name":"updateItem","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_addr","type":"address"}],"name":"getUserNameFromAcc","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_index","type":"uint256"}],"name":"deleteItem","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getItemCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_ownername","type":"string"},{"name":"_index","type":"uint256"}],"name":"getUserStoreItem","outputs":[{"name":"","type":"bool"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_username","type":"string"},{"name":"_info","type":"string"}],"name":"addLog","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getUserCount","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_buyer","type":"address"},{"name":"_buyer_log","type":"string"},{"name":"_seller","type":"address"},{"name":"_seller_log","type":"string"},{"name":"_index","type":"uint256"}],"name":"changeOwner","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_username","type":"string"}],"name":"getUserAccAddr","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_username","type":"string"}],"name":"getUserPassword","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_name","type":"string"},{"name":"_description","type":"string"},{"name":"_price","type":"uint256"},{"name":"_owner","type":"address"}],"name":"createItem","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"_username","type":"string"},{"name":"_account","type":"address"},{"name":"_password","type":"string"}],"name":"addUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_username","type":"string"},{"name":"_index","type":"uint256"}],"name":"getLog","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_username","type":"string"},{"name":"_password","type":"string"}],"name":"removeUser","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_addr","type":"address"},{"indexed":false,"name":"_user","type":"string"}],"name":"UserEvent","type":"event"}]}