"""
Geth wrapper for anarik blockchain
"""

import subprocess
import json
import sys

"""
Initialize Geth
"""
def initGeth():
    with open('config.json') as file:
        args = json.load(file)
        subprocess.call("geth init "
                        "--datadir {} "
                        " {}".format(args["data_dir"], args["genesis"]))

"""
Start mining in existing node
"""
def mineGeth():
    with open('config.json') as file:
        args = json.load(file)
        subprocess.call("geth --networkid {} "
         "--datadir {} "
         "--port {} "
         "--ipcdisable "
         "--rpc --rpcapi personal,eth,rpc,web3,net "
         "--rpcaddr {} --rpcport {} --mine"
         .format(args["net_id"], args["data_dir"], args["enode_port"], args["rpc_addr"], args["rpc_port"]))

"""
Start an existing node
"""
def startGeth():
    with open('config.json') as file:
        args = json.load(file)
        subprocess.Popen("geth --networkid {} "
         "--datadir {} "
         "--port {} "
         "--ipcdisable "
         "--rpc --rpcapi personal,eth,rpc,web3,net "
         "--rpcaddr {} --rpcport {}"
         .format(args["net_id"], args["data_dir"], args["enode_port"], args["rpc_addr"], args["rpc_port"]))

"""
Obtain console to an existing node
"""
def consoleGeth():
    with open('config.json') as file:
        args = json.load(file)
        subprocess.call("geth --networkid {} "
         "--datadir {} "
         "--port {} "
         "--ipcdisable "
         "--rpc --rpcapi personal,eth,rpc,web3,net "
         "--rpcaddr {} --rpcport {} console"
         .format(args["net_id"], args["data_dir"], args["enode_port"], args["rpc_addr"], args["rpc_port"]))


"""
Interact with existing node via console
"""
def attachGethHttp():
    with open('config.json') as file:
        args = json.load(file)
        provider = "http://{}:{}".format(args["rpc_addr"],args["rpc_port"])
        print('Connecting to: '+provider);
        subprocess.call("geth attach {} ".format(provider))

"""
Start/continue a node with given gas limit.
"""
def changeGasLimit():
    with open('config.json') as file:
        args = json.load(file)
        subprocess.call("geth --networkid {} "
         "--datadir {} "
         "--port {} "
         "--ipcdisable "
         "--targetgaslimit {} "
         "--rpc --rpcapi personal,eth,rpc,web3,net "
         "--rpcaddr {} --rpcport {} --mine"
         .format(args["net_id"], args["data_dir"], args["enode_port"], args["target_gas_limit"], args["rpc_addr"], args["rpc_port"]))

def help():
    print('USAGE: <script> init | mine | console | start | attach | target-change\n')


if __name__ == "__main__":
    if(len(sys.argv) == 2):
        if(sys.argv[1] == 'init'):
            initGeth()
        elif(sys.argv[1] == 'mine'):
            mineGeth()
        elif(sys.argv[1] == 'attach'):
            attachGethHttp()
        elif(sys.argv[1] == 'target-change'):
            changeGasLimit()
        elif(sys.argv[1] == 'console'):
            consoleGeth()
        elif(sys.argv[1] == 'start'):
            startGeth()
        else:
            help()
    else:
        help()
