import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
//import mocks from './mocks';
import resolvers from './resolvers';
import {BigInt} from "./scalars";

// language=GraphQL Schema
const typeDefs = `
type Query {
  web3: Web3!
  net: Net!
  eth: Eth!
  log(fromBlock: String, toBlock: String, address: String, topics: [String]): [Log]
}

type Web3 {
  clientVersion: String!
  sha3(value: String): String!
}

type Net {
  peerCount: Int!
  version: String!
  isListening: Boolean!
}

input TransactionInput {
  from: Address
  to: Address!
  gas: BigInt
  gasPrice: String
  value: String
  data: String
}

input EstimateGasInput {
  from: Address
  to: Address
  gas: BigInt
  gasPrice: String
  value: String
  data: String
}

enum BlockTag {
  LATEST
  EARLIEST
  PENDING
}

# 0x-prefixed 20-byte hex string
scalar Address

scalar BigInt

type Block {
  number: Int
  timestamp: Int!
  hash: String
  parentHash: String
  nonce: String
  sha3Uncles: String!
  logsBloom: String
  transactionsRoot: String!
  stateRoot: String!
  receiptsRoot: String!
  miner: String!
  difficulty: Int!
  totalDifficulty: Int!
  extraData: String!
  size: Int!
  gasLimit: BigInt!
  gasUsed: BigInt!
  transactions: [String]!
  transactionCount: Int
  uncles: [String]!
}
#type Log {
#
#}
type TransactionReceipt {
  cumulativeGasUsed: BigInt!
  gasUsed: BigInt!
  contractAddress: String
  logs: [Log]!
  logsBloom: String!
}


type Transaction {
  hash: String!
  nonce: Int!
  blockHash: String
  blockNumber: Int
  transactionIndex: Int
  from: Address!
  to: Address
  value: String!
  gasPrice: String!
  gas: Int!
  input: String!
  receipt: TransactionReceipt
}

type WithBlock {
    call(input: TransactionInput): String!
    
    balance(address: String!): String!
    code(address: String!): String!
    storageAt(address: String!, position: String!): String!
}

type CompilationOutput {
    code: String
    info: String
}


type Eth {
    protocolVersion: String!
    syncing: Syncing
    coinbase: String!
    mining: Boolean!
    hashrate: Int!
    gasPrice: String!
    accounts: [String]!
    compilers: [String]!
    
    
    block(number: Int, hash: String, tag: BlockTag): Block
    transaction(hash: String!): Transaction
    withBlock(number: Int, hash: String, tag: BlockTag): WithBlock
    estimateGas(input: EstimateGasInput): BigInt!
    compileSolidity(code: String!): CompilationOutput!
#  
#  
#  transactionCount(address: String!, defaultBlock: Block!): Int!
#  blockTransactionCountByHash(blockHash: String!): Int!
#  blockTransactionCountByNumber(block: Block!): Int!
}

type Syncing {
  startingBlock: Int,
  currentBlock: Int,
  highestBlock: Int,
}

type Log {
  address: String
  topics: [String]
  data: String
  blockNumber: String
  transactionHash: String
  blockHash: String
  logIndex: String
  removed: Boolean
}

#type Mutation {
#    
#}

schema {
   query: Query
#   mutation: Mutation
#   subscription: Subscriptions

}

`;
/*





transactions: Array - Array of transaction objects, or 32 Bytes transaction hashes depending on the last given parameter.

      "address": "0x568a0d52a173f584d4a286a22b2a876911079e15",
			"topics": [
				"0x986876e67d288f7b8bc5229976a1d5710be919feb66d2e1aec1bf3eadebba207",
				"0x0000000000000000000000007a4588442b1773eb43eee96bf4fa5e994d5c54a3",
				"0x000000000000000000000000443f9de0dc928907488197b5590abb143562a3e6"
			],
			"data": "0x0000000000000000000000000000000000000000000000008ac7230489e80000",
			"blockNumber": "0x170eb9",
			"transactionHash": "0xab6ded84e4d50c2bb9884341684bf1e4e189119f6d6df8ebff6e9164bd6e189d",
			"transactionIndex": "0x1",
			"blockHash": "0x1376dd2821c3ac1355a83fbc11b6a0bd8cbf3157d89fd5010218e02af0f0e3c5",
			"logIndex": "0x1",
			"removed": false

 */
const schema = makeExecutableSchema({ typeDefs, resolvers });

//addMockFunctionsToSchema({ schema, mocks });

export default schema;
