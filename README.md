# ConseilJS-core

[![npm version](https://img.shields.io/npm/v/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![npm](https://img.shields.io/npm/dm/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![Build Status](https://travis-ci.org/Cryptonomic/ConseilJS.svg?branch=master)](https://travis-ci.org/Cryptonomic/ConseilJS)
[![Coverage Status](https://coveralls.io/repos/github/Cryptonomic/ConseilJS/badge.svg?branch=master)](https://coveralls.io/github/Cryptonomic/ConseilJS?branch=master)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Cryptonomic_ConseilJS&metric=alert_status)](https://sonarcloud.io/dashboard?id=Cryptonomic_ConseilJS)
[![dependencies](https://david-dm.org/Cryptonomic/ConseilJS/status.svg)](https://david-dm.org/Cryptonomic/ConseilJS)

A library for building decentralized applications in Typescript and Javascript, currently focused on the [Tezos](http://tezos.com/) platform.

ConseilJS connects to Tezos nodes for live chain data and operations and to [Conseil](https://github.com/Cryptonomic/Conseil) servers for high-performance analytics on blockchain data. Internally, Cryptonomic uses [Nautilus](https://github.com/Cryptonomic/Nautilus) for infrastructure deployments of these services. This is the library at the core of our products, [Arronax](https://arronax.io), [Mininax](https://mininax.io) and certainly [Galleon](https://cryptonomic.tech/galleon.html). There are [ReasonML bindings](https://github.com/Cryptonomic/ConseilJS-ReasonML-Bindings) as well.

Cryptonomic offers an infrastructure service - [Nautilus Cloud](https://nautilus.cloud) which enables quick access to the Tezos platform along with products that make it easier build on it.

## Sub-modules

As of version 5.0.0, ConseilJS has been split into three parts: this library, which is considered to be the core, ConseilJS-softsigner and ConseilJS-ledgersigner. This was done in an effort to make the library more portable across different environments. If neither of these additional modules meet your needs, the `Signer` and `KeyStore` [interfaces](https://github.com/Cryptonomic/ConseilJS/blob/master/ConseilJS-core/src/types/ExternalInterfaces.ts) can be implemented separately. In addition to a `Signer` and a `KeyStore`, `fetch` and `logger` objects are required to be provided, see below.

For more details on how to use these libraries see their respective readme files: [ConseilJS-core](./blob/master/ConseilJS/docs/README.md), [ConseilJS-softsigner](https://github.com/Cryptonomic/ConseilJS-softsigner/blob/master/README.md), [ConseilJS-ledgersigner](https://github.com/Cryptonomic/ConseilJS-ledgersigner/blob/master/README.md).

## Use with Nodejs

Add our [NPM package](https://www.npmjs.com/package/conseiljs) to your project and a signing library.

```bash
npm i conseiljs
npm i conseiljs-softsigner
```

```javascript
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { registerFetch, registerLogger, Signer, TezosMessageUtils } from 'conseiljs';
import { KeyStoreUtils, SoftSigner } from 'conseiljs-softsigner';

const logger = log.getLogger('conseiljs');
logger.setLevel('debug', false);
registerLogger(logger);
registerFetch(fetch);

let signer: Signer;
const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey('edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH');
signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'), -1);
```

## Use with React

We have a complete [React application tutorial](https://github.com/Cryptonomic/ConseilJS-Tutorials) for you to check out.

## Use with React Native

TBD

## Use with Web

```html
<html>
<head>
    <script src="https://cdn.jsdelivr.net/gh/cryptonomic/conseiljs/dist-web/conseiljs.min.js"
        integrity="sha384-DsZ98An5RJlEquKpG7VziukP7Zqae8IlsF9VmTnz41Ga8FvAx6Hvn0hMkpBj3pms"
        crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/gh/cryptonomic/conseiljs-softsigner/dist-web/conseiljs-softsigner.min.js"
        integrity="sha384-V1iaajn0x/SMFcZ9Y/xNQmqQSKyll6Dzt27U6OWiv8NdbHTVaHOGHdQ8g0G68HPd"
        crossorigin="anonymous"></script>
    <script>
        //conseiljssoftsigner.
    </script>
</head>
<body>
    ...
</body>
</html>
```

The web version sets fetch and logger internally to `window.fetch` and `console` respectively.

A fully functional sample [html page](https://github.com/Cryptonomic/ConseilJS-HTML-Example) is available too.

## API Overview and Examples

We have [ready-to-use examples](https://cryptonomic.github.io/ConseilJS/) to copy/paste.

## Contribute

There are many ways to contribute to this project. You can develop applications or dApps with it. You can submit bug reports or feature requests. You can ask questions about it on [r/Tezos](http://reddit.com/r/tezos/) or the [Tezos StackExchange](https://tezos.stackexchange.com). We certainly welcome pull requests as well.

## Other references

[Developer Handbook](https://handbook.cryptonomic.tech/)

[Smart Contract Development Syllabus](https://medium.com/the-cryptonomic-aperiodical/smart-contract-development-syllabus-f285a8463a4d)

[Wiki](https://github.com/Cryptonomic/ConseilJS/wiki/Tutorial:-Querying-for-Tezos-alphanet-data-using-the-ConseilJS-v2-API)

[Riot Dev Channel](https://matrix.to/#/!rUwpbdwWhWgKINPyOD:cryptonomic.tech?via=cryptonomic.tech&via=matrix.org&via=ostez.com)

[Cryptonomic Reddit](https://www.reddit.com/r/cryptonomic)

[The Cryptonomic Aperiodical](https://medium.com/the-cryptonomic-aperiodical)

[@CryptonomicTech](https://twitter.com/CryptonomicTech)
