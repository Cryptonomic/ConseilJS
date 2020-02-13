# ConseilJS

[![npm version](https://img.shields.io/npm/v/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![npm](https://img.shields.io/npm/dm/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![Build Status](https://travis-ci.org/Cryptonomic/ConseilJS.svg?branch=master)](https://travis-ci.org/Cryptonomic/ConseilJS)
[![Coverage Status](https://coveralls.io/repos/github/Cryptonomic/ConseilJS/badge.svg?branch=master)](https://coveralls.io/github/Cryptonomic/ConseilJS?branch=master)
[![dependencies](https://david-dm.org/Cryptonomic/ConseilJS/status.svg)](https://david-dm.org/Cryptonomic/ConseilJS)

A library for building decentralized applications in Typescript and Javascript, currently focused on the [Tezos](http://tezos.com/) platform.

ConseilJS connects to Tezos nodes for live chain data and operations and to [Conseil](https://github.com/Cryptonomic/Conseil) servers for high-performance analytics on blockchain data. Internally, Cryptonomic uses [Nautilus](https://github.com/Cryptonomic/Nautilus) for infrastructure deployments of these services. This is the library at the core of our products, [Arronax](https://arronax.io), [Mininax](https://mininax.io) and certainly [Galleon](https://galleon-wallet.tech). There are now [ReasonML bindings](https://github.com/Cryptonomic/ConseilJS-ReasonML-Bindings) as well.

Cryptonomic offers an infrastructure service - [Nautilus Cloud](https://nautilus.cloud) which enables quick access to the Tezos platform along with products that make it easier build on it.

## Use with Nodejs

Add our [NPM package](https://www.npmjs.com/package/conseiljs) to your project.

```bash
npm i conseiljs
```

If you are using webpack in your project, add below lines to your `webpack.config.js` file:

```javascript
node: { fs: 'empty' }
```

We have a complete [React application tutorial](https://github.com/Cryptonomic/ConseilJS-Tutorials) for you to check out.

## Use with Web

```html
<script src="https://cdn.jsdelivr.net/gh/cryptonomic/conseiljs/dist-web/conseiljs.min.js"
        integrity="sha384-skzGi2G2wcGb6HD7PKVhRuFrsD71V0S9wbpslUrmLMEI0PqiXBQDnWRJESODET5m"
        crossorigin="anonymous"></script>
```

A fully functional sample [html page](https://github.com/Cryptonomic/ConseilJS-HTML-Example) is available too.

## API Overview and Examples

We have [ready-to-use examples](https://cryptonomic.github.io/ConseilJS/) to copy/paste.

## Contribute

There are many ways to contribute to this project. You can develop applications or dApps with it. You can submit bug reports or feature requests. You can ask questions about it on [r/Tezos](http://reddit.com/r/tezos/) or the [Tezos StackExchange](https://tezos.stackexchange.com). We certainly welcome pull requests as well.

### Known Issues

- Some of the P2P messages are not implemented, specifically those used in baking operations.

### Dependency Requirements

- AWS-SDK dependency must remain as the Ledger Connect feature requires it.

## Other references

[Wiki](https://github.com/Cryptonomic/ConseilJS/wiki/Tutorial:-Querying-for-Tezos-alphanet-data-using-the-ConseilJS-v2-API)

[Riot Dev Channel](https://matrix.to/#/!rUwpbdwWhWgKINPyOD:cryptonomic.tech?via=cryptonomic.tech&via=matrix.org&via=ostez.com)

[Cryptonomic Reddit](https://www.reddit.com/r/cryptonomic)

[The Cryptonomic Aperiodical](https://medium.com/the-cryptonomic-aperiodical)

[@CryptonomicTech](https://twitter.com/CryptonomicTech)
