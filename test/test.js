
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

it('sample test', async () => {
  //language=GraphQL
  const query = `
    query Q {
      web3 {
          clientVersion
      }
    }
  `;

  const { data } = await doGraphql(sch, query);
  expect(data.web3.clientVersion).toMatch(/Geth/);
});
