// @flow

import winston from 'winston'

export default class Configuration {
  jsonRpcUri: string;
  wsRpcUri: ?string;
  subscriptionsEnabled: boolean;
  port: string;
  logger: any;

  constructor(port: string,
              jsonRpcUri: string,
              wsRpcUri: ?string,
              subscriptionsEnabled: boolean,
              logLevel: string) {
    this.subscriptionsEnabled = subscriptionsEnabled;
    this.jsonRpcUri = jsonRpcUri;
    this.port = port;
    this.wsRpcUri = wsRpcUri;

    this.logger = winston.createLogger({
      level: logLevel,
      format: winston.format.simple(),
      transports: [
        new winston.transports.Console(),
      ]
    });
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

    let logLevel = process.env.ETHEREUM_GRAPHQL_LOGLEVEL;
    if (!logLevel) {
      logLevel = 'info'
    }
    return new Configuration(port, uri, ethWsRpcUri, subscriptionsEnabled, logLevel);
  }

  toString() {
    return JSON.stringify(this);
  }
}