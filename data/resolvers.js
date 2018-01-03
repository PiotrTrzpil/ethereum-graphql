import { Generic, Logs, Web3, Net, Eth } from './connectors';
import { Address, BigInt } from './scalars';


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
    call: (numberOrTag, args) => Generic.fetch('eth_call', [args, numberOrTag]),
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
    estimateGas: (_, args) => Generic.fetch('eth_estimateGas', [args]),

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

};

export default resolvers;