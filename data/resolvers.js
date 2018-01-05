import { Generic, Logs, Web3, Net, Eth } from './connectors';
import { Address, BigInt } from './scalars';
import { PubSub, withFilter } from 'graphql-subscriptions';
const WebSocket = require('ws');
const pubsub = new PubSub();

const toHex = (number) => '0x' + number.toString(16);
const blockNumberOrTag = (args) => args.number !== undefined ? toHex(args.number) : args.tag.toLowerCase();


const resolvers = {
  BigInt: BigInt,
  Address: Address,
  Net: {
    peerCount: () => Generic.fetch('net_peerCount'),
    version: () => Generic.fetch('net_version'),
    isListening: () => Generic.fetch('net_listening'),
  },
  Web3: {
    clientVersion: () => Generic.fetch('web3_clientVersion'),
    sha3: (_, args) => Generic.fetch('web3_sha3', [args.value]),
  },
  Transaction: {
    receipt: (obj) => {
      return Generic.fetch('eth_getTransactionReceipt', [obj.hash])
    }
  },
  WithBlock: {
    call: (numberOrTag, args) => Generic.fetch('eth_call', [args.input, numberOrTag]),
    balance: (numberOrTag, args) =>  Generic.fetch('eth_getBalance', [args.address, numberOrTag]),
    code: (numberOrTag, args) =>  Generic.fetch('eth_getCode', [args.address, numberOrTag]),
    storageAt: (numberOrTag, args) => Generic.fetch('eth_getStorageAt', [args.address, args.position, numberOrTag]),
  },
  Eth: {
    protocolVersion: () => Generic.fetch('eth_protocolVersion'),
    coinbase: () => Generic.fetch('eth_coinbase'),
    mining: () => Generic.fetch('eth_mining'),
    hashrate: () => Generic.fetch('eth_hashrate'),
    gasPrice: () => Generic.fetch('eth_gasPrice'),
    accounts: () => Generic.fetch('eth_accounts'),
    transaction: (_, args) => Generic.fetch('eth_getTransactionByHash', [args.hash]),
    estimateGas: (_, args) => Generic.fetch('eth_estimateGas', [args.input]),

    compilers: () => Generic.fetch('eth_getCompilers', []),
    compileSolidity: (_, args) => Generic.fetch('eth_compileSolidity', [args.code]),

    withBlock: (_, args) => {
      let promise;
      if (args.tag || args.number !== undefined) {
        promise = Promise.resolve(blockNumberOrTag(args))
      } else {
        promise = Generic.fetch('eth_getBlockByHash', [args.hash, false]).then(block => block.number)
      }
      return promise
    },

    // blockNumber: () => Generic.fetch('eth_blockNumber'),
    // transactionCount: (_, args) => {
    //   return Generic.fetch('eth_getTransactionCount', [args.address, blockDescription(args.defaultBlock)])
    // },
    // blockTransactionCountByHash: (_, args) => {
    //   return Generic.fetch('eth_getBlockTransactionCountByHash', [args.blockHash])
    // },
    // blockTransactionCountByNumber: (_, args) => {
    //   return Generic.fetch('eth_getBlockTransactionCountByNumber', [blockDescription(args.block)])
    // },
    block: (_, args) => {
      let promise;
      if (!args.hash) {
        promise = Generic.fetch('eth_getBlockByNumber', [blockNumberOrTag(args), false])
      } else {
        promise = Generic.fetch('eth_getBlockByHash', [args.hash, false])
      }
      return promise.then(blockData => {
        return blockData;
      })
    },
    syncing: () => Generic.fetch('eth_syncing').then(res => {
      if(!res) {
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
    sendRawTransaction: (_, { data }) => Generic.fetch('eth_sendRawTransaction', [data])
  },
  Subscription: {
    newHeads: {
      resolve: (payload, args, context, info) => {
        return payload;
      },
      subscribe: () => {
        const id = ethSubscribe(['newHeads']);
        return pubsub.asyncIterator('abc' + id.toString())
      }
    }
  }
};


const ws = new WebSocket('ws://127.0.0.1:8546');

let subscriptions = {};
let index = 0;

ws.on('open', function open() {

});

function ethSubscribe(params) {
  ws.send(JSON.stringify({id: index , method: 'eth_subscribe', params}));
  const prevIndex = index;
  index = index + 1;
  return prevIndex;
}
ws.on('message', function incoming(data) {

  const json = JSON.parse(data);
  if (json.id !== undefined) {
    subscriptions[json.result] = json.id
  } else {
    pubsub.publish('abc' + subscriptions[json.params.subscription],  json.params.result);
  }
});



export default resolvers;