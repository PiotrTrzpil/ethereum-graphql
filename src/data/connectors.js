import fetch from 'node-fetch';

export default class Connectors {

  constructor(config) {
    this.config = config;
    this.jsonRpcUri = config.jsonRpcUri;
  }

  async checkStatus(response) {
    const logger = this.config.logger;
    logger.debug('Received status: ' + response.status);
    if (response.status >= 200 && response.status < 300) {
      return response
    } else {
      const body = await response.text();
      let message = response.statusText;
      if (body !== '') {
        message = message + '; ' + body;
      }
      const error = new Error(message);
      error.response = response;
      throw error
    }
  }

  parseHex(hexString) {
    if (hexString.startsWith('0x')) {
      hexString = hexString.substring(2)
    }
    return parseInt(hexString, 16)
  }

  async getResult(response) {
    const body = await response.json();
    this.config.logger.debug('Received body: ' + JSON.stringify(body));
    if (body.error){
      const error = new Error(body.error.message);
      error.response = response;
      error.error = body.error;
      throw error
    } else {
      return body.result
    }
  }

  async doFetch(method, params = [], version = '2.0') {
    const body = {
      jsonrpc: version,
      method: method,
      params: params,
      id: 1
    };
    const headers =  {
      'Content-Type': 'application/json'
    };
    this.config.logger.debug('Sending: ' + JSON.stringify(body));
    const res = await fetch(this.jsonRpcUri, { method: 'POST', body: JSON.stringify(body), headers })
    const afterStatus = await this.checkStatus(res);
    return await this.getResult(afterStatus);
  }

  // Logs = {
  //   find: (input) =>
  //     doFetch('eth_getLogs', [
  //       {
  //         fromBlock: input.fromBlock,
  //         address: input.address,
  //         toBlock: input.toBlock,
  //         topics: input.topics,
  //       }
  //     ]),
  // };
  fetch(method, params = [], options = {}) {
    const promise = this.doFetch(method, params);
    if (options.hex) {
      return promise.then(this.parseHex)
    } else {
      return promise;
    }
  }
}