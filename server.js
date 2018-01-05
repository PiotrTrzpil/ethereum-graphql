import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import schema from './data/schema';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import cors from 'cors';
import { execute, subscribe } from 'graphql';

const GRAPHQL_PORT = 3000;
const graphQLServer = express();


graphQLServer.use('*', cors({ origin: `http://localhost:${GRAPHQL_PORT}` }));
graphQLServer.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));
graphQLServer.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `ws://localhost:${GRAPHQL_PORT}/subscriptions`
}));


const ws = createServer(graphQLServer);
ws.listen(GRAPHQL_PORT, () => {
  console.log(`Apollo Server is now running on http://localhost:${GRAPHQL_PORT}`);
  new SubscriptionServer({
    execute,
    subscribe,
    schema,
  }, {
    server: ws,
    path: '/subscriptions',
  });
});

