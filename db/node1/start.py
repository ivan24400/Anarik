import subprocess
import json

with open('config.json') as file:
    args = json.load(file)
    print(args)
    subprocess.call("geth --networkid 1824 "
     "--datadir {} "
     "--targetgaslimit {} "
     "--rpc --rpcapi personal,eth,rpc,web3,net "
     "--rpcaddr {} --rpcport {} --mine"
     .format(args["data_dir"], args["target_gas_limit"], args["rpc_addr"], args["rpc_port"]))
