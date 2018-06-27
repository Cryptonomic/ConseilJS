# ConseilJS
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