# ConseilJS

[![npm version](https://img.shields.io/npm/v/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![npm](https://img.shields.io/npm/dm/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)

Client-side library for building decentralized applications, currently focused on [Tezos](http://tezos.com/).

ConseilJS connects to [Conseil](https://github.com/Cryptonomic/Conseil) for cached blockchain data and [Nautilus](https://github.com/Cryptonomic/Nautilus) for live chain data and operations.

## Use

Add our [NPM package]() to your project.

In your `webpack.config.js` file, add:

```javascript
 node: {
    fs: 'empty'
  }
```  

## Develop

`TezosNodeQuery` queries Tezos blockchain nodes directly.

`TezosConseilQuery` queries Conseil server to get blockchain data. 

`TezosOperations` performs operations such as transactions, delegation and originations.

`TezosWallet` provides wallet functionality.

Example import:

```import { TezosOperations } from 'conseiljs';```

### Run Tests

Add a file called `test/servers.ts` with these contents:

```javascript
export const servers = {
    conseilServer: '',
    conseilApiKey: '',
    tezosServer: ''
}
``` 

The blank strings should be replaced with the details of actual test servers. 

After this, run `npm run test` to run all unit tests.


### Dependency Issues 
- As later versions of the npm package libsodium-sumo (a JS wrapper around libSodium) do not support all methods of libSodium, this version must remain at 0.5.4
- AWS-SDK dependency must remain as the Ledger Connect feature depends on this package
