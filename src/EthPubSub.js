// @flow

import {PubSub} from "graphql-subscriptions";
import WebSocket from "ws";

export default class EthPubSub {
  pubsub: PubSub;
  ws: WebSocket;
  subscriptions: { [string]: number };
  index: number;

  constructor(wsRpcUri: string) {
    this.pubsub  = new PubSub();
    this.subscriptions = {};
    this.index = 0;
    this.ws = new WebSocket(wsRpcUri);
    this.ws.on('open', function open() {
    });

    this.ws.on('message', this.incoming);
  }

  incoming(data: any) {
    const json = JSON.parse(data);
    if (json.id !== undefined) {
      this.subscriptions[json.result] = json.id
    } else {
      const ele = this.subscriptions[json.params.subscription];
      this.pubsub.publish('abc' + ele,  json.params.result);
    }
  }

  ethSubscribe(params: any) {
    this.ws.send(JSON.stringify({id: this.index , method: 'eth_subscribe', params}));
    const prevIndex = this.index;
    this.index = this.index + 1;
    return prevIndex;
  }
}