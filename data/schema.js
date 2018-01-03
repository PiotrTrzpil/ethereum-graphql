import { makeExecutableSchema} from 'graphql-tools';
import resolvers from './resolvers';

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
}

`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

export default schema;
