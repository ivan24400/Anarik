"""
Geth wrapper
"""

import subprocess
import json
import sys


def initGeth():
    with open('config.json') as file:
        args = json.load(file)
        subprocess.call("geth init "
                        "--datadir {} "
                        " {}".format(args["data_dir"], args["genesis"]))


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


def attachGethHttp():
    with open('config.json') as file:
        args = json.load(file)
        provider = "http://{}:{}".format(args["rpc_addr"],args["rpc_port"])
        print('Connecting to: '+provider);
        subprocess.call("geth attach {} ".format(provider))


def help():
    print('USAGE: <script> init | mine | attach\n')


if __name__ == "__main__":
    if(len(sys.argv) == 2):
        if(sys.argv[1] == 'init'):
            initGeth()
        elif(sys.argv[1] == 'mine'):
            mineGeth()
        elif(sys.argv[1] == 'attach'):
            attachGethHttp()
        else:
            help()
    else:
        help()
