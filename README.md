# ConseilJS

[![npm version](https://img.shields.io/npm/v/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![npm](https://img.shields.io/npm/dm/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![Build Status](https://travis-ci.org/Cryptonomic/ConseilJS.svg?branch=master)](https://travis-ci.org/Cryptonomic/ConseilJS)
[![Coverage Status](https://coveralls.io/repos/github/Cryptonomic/ConseilJS/badge.svg?branch=master)](https://coveralls.io/github/Cryptonomic/ConseilJS?branch=master)
[![dependencies](https://david-dm.org/Cryptonomic/ConseilJS/status.svg)](https://david-dm.org/Cryptonomic/ConseilJS)

Client-side library for building decentralized applications, currently focused on [Tezos](http://tezos.com/).

ConseilJS connects to [Conseil](https://github.com/Cryptonomic/Conseil) for cached blockchain data and [Nautilus](https://github.com/Cryptonomic/Nautilus) for live chain data and operations.

## Use

Add our [NPM package](https://www.npmjs.com/package/conseiljs) to your project.

```bash
$ npm i conseiljs

```

If you are using webpack in your project, add below lines to your `webpack.config.js` file:

```javascript
 node: {
    fs: 'empty'
  }
```  

## Develop

You can find some tutorials in our [wiki](https://github.com/Cryptonomic/ConseilJS/wiki/Tutorial:-Querying-for-Tezos-alphanet-data-using-the-ConseilJS-v2-API) to help you get started with ConseilJS.

Below is the list of namespaces you can import to your project and start building immediately:

`TezosNodeQuery` - Utility functions for interacting with the Tezos node.

`TezosConseilClient` - Functions for querying the Conseil backend REST API v2

`TezosConseilQuery` - Functions for querying the Conseil backend REST API v1

`TezosHardwareWallet` - Functions for interaction with the Tezos node via a Hardware wallet. (Supports only Ledger Nano S for now)

`TezosMessageCodec` - A collection of functions to encode and decode various Tezos P2P message components

`TezosOperations` - Functions for sending operations on the Tezos network.

`TezosWallet` - Functions for Tezos wallet functionality.

`TezosTypes` - Types used to process data returned from Conseil server.

Example import:

```javascript
import { TezosOperations } from 'conseiljs';
```

## Run Tests

### Unit Tests

`npm run test` runs all unit tests.

### Integration Tests

Add a file called `servers.ts` under the `integration_test` with these contents:

```javascript
export const servers = {
    conseilServer: '',
    conseilApiKey: '',
    tezosServer: ''
}
```

The blank strings should be replaced with the details of your Conseil & Tezos servers.

After this, `npm run integration-test` to run all integration tests.
Please note that some of the integration tests require the usage of a hardware wallet.

### Dependency Issues
- As later versions of the npm package libsodium-sumo (a JS wrapper around libSodium) do not support all methods of libSodium, this version must remain at 0.5.4
- AWS-SDK dependency must remain as the Ledger Connect feature depends on this package
