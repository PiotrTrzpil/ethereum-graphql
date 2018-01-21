import {GraphQLScalarType} from "graphql";
const { STRING, INT } = require('graphql/language/kinds');

const Address = new GraphQLScalarType({
  name: 'Address',
  description: 'Ethereum account or contract address',
  serialize(value) {
    return value.toString();
  },
  parseValue(value) {
    if (!value.startsWith('0x')) {
      throw 'Invalid address: ' + value;
    }
    return value;
  },
  parseLiteral(ast) {
    if (ast.kind === STRING) {
      if (!ast.value.startsWith('0x')) {
        throw 'Invalid address: ' + ast.value;
      }
      return ast.value
    }
    return null
  }
});


// Modified from https://github.com/stems/graphql-bigint

const MAX_INT = Number.MAX_SAFE_INTEGER;
const MIN_INT = Number.MIN_SAFE_INTEGER;

const BigInt = new GraphQLScalarType({
  name: 'BigInt',
  description:
  'The `BigInt` scalar type represents non-fractional signed whole numeric ' +
  'values. BigInt can represent values between -(2^53) + 1 and 2^53 - 1, otherwise it falls back to string',
  serialize: coerceBigInt,
  parseValue: coerceBigInt,
  parseLiteral(ast) {
    if (ast.kind === INT) {
      const num = parseInt(ast.value, 10);
      if (num <= MAX_INT && num >= MIN_INT) {
        return num
      }
    }
    return ast.value
  }
});

function coerceBigInt(value) {
  if (value === '') {
    throw new TypeError(
      'BigInt cannot represent non 53-bit signed integer value: (empty string)'
    )
  }
  const num = Number(value);
  if (num !== num || num > MAX_INT || num < MIN_INT) {
    return value;
  }
  const int = Math.floor(num);
  if (int !== num) {
    throw new TypeError(
      'BigInt cannot represent non-integer value: ' + String(value)
    )
  }
  return int
}




export { Address, BigInt }