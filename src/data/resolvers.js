import { Address, BigInt } from './scalars';
import Configuration from "../configuration";
import EthPubSub from "../EthPubSub";
import Connectors from "./connectors";


const toHex = (number) => '0x' + number.toString(16);
const blockNumberOrTag = (args) => args.number !== undefined ? toHex(args.number) : args.tag.toLowerCase();


export default class Resolvers {

  ethPubSub: ?EthPubSub;
  config: Configuration;
  
  constructor(ethPubSub: ?EthPubSub, config: Configuration) {
    this.ethPubSub = ethPubSub;
    this.config = config;
    this.connectors = new Connectors(config);
  }
  
  resolvers() {
    return {
      BigInt: BigInt,
      Address: Address,
      Net: {
        peerCount: () => this.connectors.fetch('net_peerCount'),
        version: () => this.connectors.fetch('net_version'),
        isListening: () => this.connectors.fetch('net_listening'),
      },
      Web3: {
        clientVersion: () => this.connectors.fetch('web3_clientVersion'),
        sha3: (_, args) => this.connectors.fetch('web3_sha3', [args.value]),
      },
      Transaction: {
        receipt: (obj) => {
          return this.connectors.fetch('eth_getTransactionReceipt', [obj.hash])
        }
      },
      WithBlock: {
        call: (numberOrTag, args) => this.connectors.fetch('eth_call', [args.input, numberOrTag]),
        balance: (numberOrTag, args) => this.connectors.fetch('eth_getBalance', [args.address, numberOrTag]),
        code: (numberOrTag, args) => this.connectors.fetch('eth_getCode', [args.address, numberOrTag]),
        storageAt: (numberOrTag, args) => this.connectors.fetch('eth_getStorageAt', [args.address, args.position, numberOrTag]),
      },
      Eth: {
        protocolVersion: () => this.connectors.fetch('eth_protocolVersion'),
        coinbase: () => this.connectors.fetch('eth_coinbase'),
        mining: () => this.connectors.fetch('eth_mining'),
        hashrate: () => this.connectors.fetch('eth_hashrate'),
        gasPrice: () => this.connectors.fetch('eth_gasPrice'),
        accounts: () => this.connectors.fetch('eth_accounts'),
        transaction: (_, args) => this.connectors.fetch('eth_getTransactionByHash', [args.hash]),
        estimateGas: (_, args) => this.connectors.fetch('eth_estimateGas', [args.input]),

        compilers: () => this.connectors.fetch('eth_getCompilers', []),
        compileSolidity: (_, args) => this.connectors.fetch('eth_compileSolidity', [args.code]),

        withBlock: (_, args) => {
          let promise;
          if (args.tag || args.number !== undefined) {
            promise = Promise.resolve(blockNumberOrTag(args))
          } else {
            promise = this.connectors.fetch('eth_getBlockByHash', [args.hash, false]).then(block => block.number)
          }
          return promise
        },

        // blockNumber: () => this.connectors.fetch('eth_blockNumber'),
        // transactionCount: (_, args) => {
        //   return this.connectors.fetch('eth_getTransactionCount', [args.address, blockDescription(args.defaultBlock)])
        // },
        // blockTransactionCountByHash: (_, args) => {
        //   return this.connectors.fetch('eth_getBlockTransactionCountByHash', [args.blockHash])
        // },
        // blockTransactionCountByNumber: (_, args) => {
        //   return this.connectors.fetch('eth_getBlockTransactionCountByNumber', [blockDescription(args.block)])
        // },
        block: (_, args) => {
          let promise;
          if (!args.hash) {
            promise = this.connectors.fetch('eth_getBlockByNumber', [blockNumberOrTag(args), false])
          } else {
            promise = this.connectors.fetch('eth_getBlockByHash', [args.hash, false])
          }
          return promise.then(blockData => {
            return blockData;
          })
        },
        syncing: () => this.connectors.fetch('eth_syncing').then(res => {
          if (!res) {
            return null;
          } else {
            return res;
          }
        }),
      },
      Query: {
        web3: () => ({}),
        net: () => ({}),
        eth: () => ({}),
        log(_, args) {
          return Logs.find(args);
        }
      },

      Mutation: {
        sendRawTransaction: (_, {data}) => this.connectors.fetch('eth_sendRawTransaction', [data])
      },
      Subscription: {
        newHeads: {
          resolve: (payload, args, context, info) => {
            return payload;
          },
          subscribe: () => {
            if (this.ethPubSub) {
              const id = this.ethPubSub.ethSubscribe(['newHeads']);
              return pubsub.asyncIterator('abc' + id.toString())
            } else {
              throw 'Subscriptions are not enabled.'
            }

          }
        }
      }
    }
  }
};
