
import { graphql } from 'graphql';
import  schema  from '../src/data/schema.js';
import Configuration from "../src/configuration";

const sch = schema(Configuration.fromEnv());

const doGraphql = async (sch, query) => {
  const result = await graphql(sch, query, {}, {});
  if (result.errors) {
    throw result.errors;
  }
  return result;
};

it('web3', async () => {
  //language=GraphQL
  const query = `
    query { web3 {
        clientVersion
        sha3(value: "0x68656c6c6f20776f726c64")
    } }
  `;

  const { data } = await doGraphql(sch, query);
  expect(data.web3.clientVersion).toMatch(/.+/);
  expect(data.web3.sha3).toBe('0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad');
});


it('net', async () => {
  //language=GraphQL
  const query = `
    query { net {
        version
        peerCount
        isListening
    } }
  `;

  const { data } = await doGraphql(sch, query);
  expect(data.net.peerCount).toBeGreaterThan(0);
  expect(data.net.version).toMatch(/.+/);
  expect(typeof data.net.isListening).toBe('boolean');
});



// it('eth.coinbase', async () => {
//   //language=GraphQL
//   const query = `
//       query { eth { coinbase } }
//   `;
//
//   const { data } = await doGraphql(sch, query);
//   expect(data.eth.coinbase).toMatch(/^0x/);
// });



it('eth.mining', async () => {
  //language=GraphQL
  const query = `
      query { eth {
          protocolVersion
          mining
          hashrate
          gasPrice
      } }
  `;

  const { data } = await doGraphql(sch, query);

  expect(data.eth.protocolVersion).toBeGreaterThan(0);
  expect(typeof data.eth.mining).toBe('boolean');
  expect(typeof data.eth.hashrate).toBe('number');
  expect(data.eth.gasPrice).toMatch(/^0x/);
});
