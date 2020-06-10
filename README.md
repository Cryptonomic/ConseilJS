# ConseilJS

[![npm version](https://img.shields.io/npm/v/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![npm](https://img.shields.io/npm/dm/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![Build Status](https://travis-ci.org/Cryptonomic/ConseilJS.svg?branch=master)](https://travis-ci.org/Cryptonomic/ConseilJS)
[![Coverage Status](https://coveralls.io/repos/github/Cryptonomic/ConseilJS/badge.svg?branch=master)](https://coveralls.io/github/Cryptonomic/ConseilJS?branch=master)
[![dependencies](https://david-dm.org/Cryptonomic/ConseilJS/status.svg)](https://david-dm.org/Cryptonomic/ConseilJS)

A library for building decentralized applications in Typescript and Javascript, currently focused on the [Tezos](http://tezos.com/) platform.

ConseilJS connects to Tezos nodes for live chain data and operations and to [Conseil](https://github.com/Cryptonomic/Conseil) servers for high-performance analytics on blockchain data. Internally, Cryptonomic uses [Nautilus](https://github.com/Cryptonomic/Nautilus) for infrastructure deployments of these services. This is the library at the core of our products, [Arronax](https://arronax.io), [Mininax](https://mininax.io) and certainly [Galleon](https://galleon-wallet.tech). There are [ReasonML bindings](https://github.com/Cryptonomic/ConseilJS-ReasonML-Bindings) as well.

Cryptonomic offers an infrastructure service - [Nautilus Cloud](https://nautilus.cloud) which enables quick access to the Tezos platform along with products that make it easier build on it.

## Sub-modules

As of version 5.0.0, ConseilJS has been split into three parts: a core library for blockchain interaction: ConseilJS-core, ConseilJS-softsigner and ConseilJS-ledgersigner. This was done in an effort to make the library more portable across different environments. If neither of these additional modules meet your needs, the `Signer` and `KeyStore` [interfaces](https://github.com/Cryptonomic/ConseilJS/blob/master/ConseilJS-core/src/types/ExternalInterfaces.ts) can be implemented separately. In addition to a `Signer` and a `KeyStore`, `fetch` and `logger` objects are required to be provided, [see examples](./blob/master/ConseilJS-core/README.md#use-with-nodejs).

For more details on how to use these libraries see their respective readme files: [ConseilJS-core](./blob/master/ConseilJS-core/README.md), [ConseilJS-softsigner](./blob/master/ConseilJS-softsigner/README.md), [ConseilJS-ledgersigner](./blob/master/ConseilJS-ledgersigner/README.md).

## Other references

[Developer Handbook](https://handbook.cryptonomic.tech/)

[Smart Contract Development Syllabus](https://medium.com/the-cryptonomic-aperiodical/smart-contract-development-syllabus-f285a8463a4d)

[Wiki](https://github.com/Cryptonomic/ConseilJS/wiki/Tutorial:-Querying-for-Tezos-alphanet-data-using-the-ConseilJS-v2-API)

[Riot Dev Channel](https://matrix.to/#/!rUwpbdwWhWgKINPyOD:cryptonomic.tech?via=cryptonomic.tech&via=matrix.org&via=ostez.com)

[Cryptonomic Reddit](https://www.reddit.com/r/cryptonomic)

[The Cryptonomic Aperiodical](https://medium.com/the-cryptonomic-aperiodical)

[@CryptonomicTech](https://twitter.com/CryptonomicTech)
