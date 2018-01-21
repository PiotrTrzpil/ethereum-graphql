// @flow
export default class Configuration {
  jsonRpcUri: string;
  wsRpcUri: ?string;
  subscriptionsEnabled: boolean;
  port: string;

  constructor(port: string, jsonRpcUri: string, wsRpcUri: ?string, subscriptionsEnabled: boolean) {
    this.subscriptionsEnabled = subscriptionsEnabled;
    this.jsonRpcUri = jsonRpcUri;
    this.port = port;
    this.wsRpcUri = wsRpcUri;
  }

  static fromEnv(): Configuration {
    const uri = process.env.JSON_RPC_URI;
    if (!uri) {
      throw ('JSON_RPC_URI env variable is not defined. Please define it to point to Ethereum JSON RPC server.')
    }

    const subscriptionsEnabled = process.env.ENABLE_SUBSCRIPTIONS === 'true';

    let ethWsRpcUri = process.env.ETH_WS_RPC_URI;

    let port = process.env.ETHEREUM_GRAPHQL_PORT;
    if (!port) {
      port = '3000'
    }

    return new Configuration(port, uri, ethWsRpcUri, subscriptionsEnabled);
  }

  toString() {
    return JSON.stringify(this);
  }
}