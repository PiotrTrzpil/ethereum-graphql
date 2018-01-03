import fetch from 'node-fetch';

const base = 'http://127.0.0.1:8545';

function checkStatus(response) {
  console.log('Received status: ' + response.status)
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    return response.text().then(body => {
      let message = response.statusText;
      if (body !== '') {
        message = message + '; ' + body;
      }
      const error = new Error(message);
      error.response = response;
      throw error
    });
  }
}

function parseHex(hexString) {
  if (hexString.startsWith('0x')) {
    hexString = hexString.substring(2)
  }
  return parseInt(hexString, 16)
}

function getResult(response) {
  return response.json().then( (body) => {
    console.log('Received body: ' + JSON.stringify(body));
    if (body.error){
      const error = new Error(body.error.message);
      error.response = response;
      error.error = body.error;
      throw error
    } else {
      return body.result
    }
  });
}

function doFetch(method, params = [], version = '2.0') {
  const body = {
    jsonrpc: version,
    method: method,
    params: params,
    id: 1
  };
  const headers =  {
    'Content-Type': 'application/json'
  };
  console.log('Sending: ' + JSON.stringify(body));
  return fetch(base, { method: 'POST', body: JSON.stringify(body), headers })
    .then(checkStatus)
    .then(getResult);
}

const Logs = {
  find: (input) =>
     doFetch('eth_getLogs', [
      {
        fromBlock: input.fromBlock,
        address: input.address,
        toBlock: input.toBlock,
        topics: input.topics,
      }
    ]),
};
const Generic = {
  fetch: (method, params = [], options = {}) => {
    const promise = doFetch(method, params);
    if (options.hex) {
      return promise.then(parseHex)
    } else {
      return promise;
    }
  }
};
const Web3 = {
};
const Net = {
};
const Eth = {
};
export { Generic, Logs, Web3, Net, Eth };