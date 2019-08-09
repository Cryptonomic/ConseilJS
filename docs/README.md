<!-- markdownlint-disable MD024 -->
# ConseilJS

[![npm version](https://img.shields.io/npm/v/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![npm](https://img.shields.io/npm/dm/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![Build Status](https://travis-ci.org/Cryptonomic/ConseilJS.svg?branch=master)](https://travis-ci.org/Cryptonomic/ConseilJS)
[![Coverage Status](https://coveralls.io/repos/github/Cryptonomic/ConseilJS/badge.svg?branch=master)](https://coveralls.io/github/Cryptonomic/ConseilJS?branch=master)
[![dependencies](https://david-dm.org/Cryptonomic/ConseilJS/status.svg)](https://david-dm.org/Cryptonomic/ConseilJS)

A library for building decentralized applications, currently focused on [Tezos](http://tezos.com/).

ConseilJS connects to the [Nautilus](https://github.com/Cryptonomic/Nautilus) infrastructure for high-performance analytics provided by [Conseil](https://github.com/Cryptonomic/Conseil) and for live chain data and operations via the integrated Tezos node.

## Use with Nodejs

Add our [NPM package](https://www.npmjs.com/package/conseiljs) to your project, or include in your web project as: ``.

```bash
npm i conseiljs
```

If you are using webpack in your project, add below lines to your `webpack.config.js` file:

```javascript
node: { fs: 'empty' }
```

We have a complete [React application example](https://github.com/Cryptonomic/ConseilJS-Tutorials) for you to check out.

## Use with Web

```html
<script src="https://cdn.jsdelivr.net/gh/cryptonomic/conseiljs/dist-web/conseiljs.min.js"
        integrity="sha384-2Vr3C3i7dq94sKc7JerYrW/o6fjD42NgOgfqNlw7ntyCQ0eMqHAk1ENOyQsXtJXo"
        crossorigin="anonymous"></script>
```

A fully functional sample [webpage example](https://github.com/Cryptonomic/ConseilJS-HTML-Example) is available too.

## API Overview and Examples

### Logs

When using ConseilJS in the context of Nodejs, it's possible to control how verbose the logs are.

<!-- tabs:start -->
#### **Typescript**

```typescript
import { setLogLevel } from 'conseiljs';

setLogLevel('debug');
```

#### **JavaScript**

```javascript
const conseiljs = require('conseiljs');

conseiljs.setLogLevel('debug');
```
<!-- tabs:end -->

Default log level is 'info', the library used internally for logging is [logleve](https://www.npmjs.com/package/loglevel).

### Contract Development Lightning Route

If you want to skip straight to working on Michelson smart contracts simply follow these instructions in the following order:

1. [Create node project](https://nodejs.org/en/docs/guides/getting-started-guide/)
1. [Install ConseilJS](#Use-with-Nodejs)
1. [Get an API key](#API-Key)
1. [Create a Tezos alphanet account](#Create-an-Tezos-alphanet-account)
1. [Initialize the account](#Initialize-the-account)
1. [Deploy a contract](#Deploy-a-Contract)
1. [Invoke a contract](#Invoke-a-Contract)

### Blockchain Analytics Lightning Route

If your interests lay in statistics and business intelligence, ConseilJS has tools for that as well. While for heavier data extraction using [Conseil](https://cryptonomic.github.io/Conseil) directly may make more sense, if you are building user tools like dashboards ConseilJS will make the process vastly easier.

1. [Create node project](https://nodejs.org/en/docs/guides/getting-started-guide/)
1. [Install ConseilJS](#Use-with-Nodejs)
1. [Get an API key](#API-Key)
1. [Run reports](#reporting--analytics-functions)

### API Key

Some ConseilJS functions require an API key for a Conseil service instance. While direct chain interactions happen via a Tezos node, Conseil read operations like those in `TezosConseilClient` namespace do require an API key however.

Obtaining a development key is easy. Hit us on the [Riot Dev Channel](https://matrix.to/#/!rUwpbdwWhWgKINPyOD:cryptonomic.tech?via=cryptonomic.tech&via=matrix.org&via=ostez.com) and we'll hook you up.

### Tezos Chain Operations

To execute operations on the Tezos chain a link to a Tezos node is required. One can be found on the [tzscan public node page](https://tzscan.io/nodes). Be sure to initialize the `tezosNode` variable accordingly. Interface to this functionality is in the `TezosNodeWriter` namespace.

#### Create a Tezos alphanet account

Visit [Alphanet Faucet](https://faucet.tzalpha.net) to get a test account on the Tezos Alphanet. With this information we can create the public and private keys necessary to participate in the network. In the below examples, `alphanetFaucetAccount` is assigned the contents of the file the faucet produces.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosWalletUtil } from 'conseiljs';

const alphanetFaucetAccount = {
    "mnemonic": [ "letter", "pair", "shuffle", "exotic", "sword", "west", "build", "monster", "future", "senior", "salt", "satisfy", "knock", "alert", "gorilla"],
    "secret": "96391f810cbe7d0a7dd4ed851f7fb20e3c5bc723",
    "amount": "5652123072",
    "pkh": "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z",
    "password": "VvLbJMu1fF",
    "email": "yoyhmapi.ugewcsiv@tezos.example.org"
}

async function initAccount() {
    const keystore = await TezosWalletUtil.unlockFundraiserIdentity(alphanetFaucetAccount.mnemonic.join(' '), alphanetFaucetAccount.email, alphanetFaucetAccount.password, alphanetFaucetAccount.pkh);
    console.log(`public key: ${keystore.publicKey}`);
    console.log(`secret key: ${keystore.privateKey}`);
}

initAccount();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const alphanetFaucetAccount = {
    "mnemonic": [ "letter", "pair", "shuffle", "exotic", "sword", "west", "build", "monster", "future", "senior", "salt", "satisfy", "knock", "alert", "gorilla"],
    "secret": "96391f810cbe7d0a7dd4ed851f7fb20e3c5bc723",
    "amount": "5652123072",
    "pkh": "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z",
    "password": "VvLbJMu1fF",
    "email": "yoyhmapi.ugewcsiv@tezos.example.org"
}

async function initAccount() {
    const keystore = await conseiljs.TezosWalletUtil.unlockFundraiserIdentity(alphanetFaucetAccount.mnemonic.join(' '), alphanetFaucetAccount.email, alphanetFaucetAccount.password, alphanetFaucetAccount.pkh);
    console.log(`public key: ${keystore.publicKey}`);
    console.log(`secret key: ${keystore.privateKey}`);
}

initAccount();
```
<!-- tabs:end -->

This produces a public key of `edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG` and secret key of `edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB`. **Secret keys must be kept secure!**

#### Initialize the account

An account must be activated on the chain before it can be used. With the combination of the faucet output and the keys generated in the step above we can send an account activation operation.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosNodeWriter, StoreType } from 'conseiljs';

const tezosNode = '';

async function activateAccount() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const result = await TezosNodeWriter.sendIdentityActivationOperation(tezosNode, keystore, '96391f810cbe7d0a7dd4ed851f7fb20e3c5bc723', '');
    console.log(`Injected operation group id ${result.operationGroupID}`)
}

activateAccount();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

async function activateAccount() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
    const result = await conseiljs.TezosNodeWriter.sendIdentityActivationOperation(tezosNode, keystore, '96391f810cbe7d0a7dd4ed851f7fb20e3c5bc723', '');
    console.log(`Injected operation group id ${result.operationGroupID}`)
}

activateAccount();

```
<!-- tabs:end -->

Operation result can be viewed on a [block explorer](https://alphanet.tzscan.io/ont2jgMsL51w3BAMJhqgsg6AoySLXsAXKzBrF1Xdyqw9f6dq8hE) for more details.

The next step on Tezos is an account revelation.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosNodeWriter, StoreType } from 'conseiljs';

const tezosNode = '';

async function revealAccount() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };

    const result = await TezosNodeWriter.sendKeyRevealOperation(tezosNode, keystore);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

revealAccount();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

async function revealAccount() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };

    const result = await conseiljs.TezosNodeWriter.sendKeyRevealOperation(tezosNode, keystore);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

revealAccount();
```
<!-- tabs:end -->

Once again we can confirm the results: [`ooFjXs4oCWfpm5XbbMPa9spohRk3933qmDDBBLkbDPcdPpxL9eM`](https://alphanet.tzscan.io/ooFjXs4oCWfpm5XbbMPa9spohRk3933qmDDBBLkbDPcdPpxL9eM).

#### Transfer value

The most basic operation on the chain is the transfer of value between two accounts. In this example we have the account we activated above: `tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z` and some random Alphanet address to test with: `tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2`. Note all amounts are in µtz, as in micro-tez, hence 0.5tz is represented as `500000`.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosNodeWriter, StoreType } from 'conseiljs';

const tezosNode = '';

async function sendTransaction() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };

    const result = await TezosNodeWriter.sendTransactionOperation(tezosNode, keystore, 'tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2', 500000, 1500, '');
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

sendTransaction();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

async function sendTransaction() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };

    const result = await conseiljs.TezosNodeWriter.sendTransactionOperation(tezosNode, keystore, 'tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2', 500000, 1500, '');
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

sendTransaction();
```
<!-- tabs:end -->

The results: [`onj7NTxcaW5Gopx7cy6Wwxxfe6ttFFyZmgqkHEhCxTsZ7Qx7a5h`](https://alphanet.tzscan.io/onj7NTxcaW5Gopx7cy6Wwxxfe6ttFFyZmgqkHEhCxTsZ7Qx7a5h).

#### Delegate

One of the most exciting features of Tezos is delegation. To delegate tz, an account must be originated. We picked a random Alphanet baker to delegate to: `tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB`. Note, this is an initial delegation which can be done together with an origination operation.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosNodeWriter, StoreType } from 'conseiljs';

const tezosNode = '';

async function originateAccount() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const result = await TezosNodeWriter.sendAccountOriginationOperation(tezosNode, keystore, 100000000, 'tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB', true, true, 10000, '');
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

originateAccount();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

async function originateAccount() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
    const result = await conseiljs.TezosNodeWriter.sendAccountOriginationOperation(tezosNode, keystore, 100000000, 'tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB', true, true, 10000, '');
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

originateAccount();
```
<!-- tabs:end -->

The results: [`ooqNtzH1Pxt3n7Bas9JsRW1f8QLEU4yABQbqHiXL5aws4H2rwVA`](https://alphanet.tzscan.io/ooqNtzH1Pxt3n7Bas9JsRW1f8QLEU4yABQbqHiXL5aws4H2rwVA). Note that as demonstrated above, it is possible to originate a new account and delegate it in one opration. To re-delegate an existing originated account use [sendDelegationOperation](#sendDelegationOperation), to remove the delegate, call [sendDelegationOperation](#sendUndelegationOperation)

#### Re-delegate

Implicit accounts, ones starting with tz1, tz2 and tz3, can control multiple originated, KT1, accounts, more than one of which can be delegated. To change the delegate on an existing originated account use the `sendDelegationOperation` method.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosNodeWriter, StoreType } from 'conseiljs';

const tezosNode = '';

async function delegateAccount() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };

    const result = await TezosNodeWriter.sendDelegationOperation(tezosNode, keystore, keystore.publicKeyHash, 'tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB', 10000);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

delegateAccount();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

async function delegateAccount() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };

    const result = await conseiljs.TezosNodeWriter.sendDelegationOperation(tezosNode, keystore, keystore.publicKeyHash, 'tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB', 10000);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

delegateAccount();
```
<!-- tabs:end -->

#### Deploy a Contract

A note of warning, as of Tezos Protocol 4, deployed in the spring of 2019, originated accounts with code (smart contracts) are no longer 'spendable'. What this means is, deploying a contract with an initial balance that does not have functionality internally that enables transfer of this balance, will permanently lock that amount of XTZ.

Deploying a contract with Micheline code is possible with local forging as of ConseilJS 0.2.5.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { StoreType, TezosNodeWriter, TezosParameterFormat, setLogLevel } from 'conseiljs';

setLogLevel('debug');

const tezosNode = '';

async function deployContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const contract = `[
        {
           "prim":"parameter",
           "args":[ { "prim":"string" } ]
        },
        {
           "prim":"storage",
           "args":[ { "prim":"string" } ]
        },
        {
           "prim":"code",
           "args":[
              [  
                 { "prim":"CAR" },
                 { "prim":"NIL", "args":[ { "prim":"operation" } ] },
                 { "prim":"PAIR" }
              ]
           ]
        }
     ]`;
    const storage = '{"string": "Sample"}';

    const result = await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keystore, 0, undefined, false, true, 100000, '', 1000, 100000, contract, storage, TezosParameterFormat.Micheline);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

setLogLevel('debug');

async function deployContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
    const contract = `[
        {
           "prim":"parameter",
           "args":[ { "prim":"string" } ]
        },
        {
           "prim":"storage",
           "args":[ { "prim":"string" } ]
        },
        {
           "prim":"code",
           "args":[
              [  
                 { "prim":"CAR" },
                 { "prim":"NIL", "args":[ { "prim":"operation" } ] },
                 { "prim":"PAIR" }
              ]
           ]
        }
     ]`;
    const storage = '{"string": "Sample"}';

    const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(tezosNode, keystore, 0, undefined, false, true, 100000, '', 1000, 100000, contract, storage, conseiljs.TezosParameterFormat.Micheline);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();

```
<!-- tabs:end -->

It's possible to deploy a contract with Michelson code on an experimental basis with local forging as of ConseilJS 0.2.7.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { StoreType, TezosNodeWriter, TezosParameterFormat, setLogLevel } from 'conseiljs';

setLogLevel('debug');

const tezosNode = '';

async function deployContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const contract = `parameter string;
        storage string;
        code { DUP;
            DIP { CDR ; NIL string ; SWAP ; CONS } ;
            CAR ; CONS ;
            CONCAT;
            NIL operation; PAIR}`;
    const storage = '"Sample"';

    const result = await TezosNodeWriter.sendContractOriginationOperation(tezosNode, keystore, 0, undefined, false, true, 100000, '', 1000, 100000, contract, storage, TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

conseiljs.setLogLevel('debug');

async function deployContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
    const contract = `parameter string;
        storage string;
        code { DUP;
            DIP { CDR ; NIL string ; SWAP ; CONS } ;
            CAR ; CONS ;
            CONCAT;
            NIL operation; PAIR}`;
    const storage = '"Sample"';

    const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(tezosNode, keystore, 0, undefined, false, true, 100000, '', 1000, 100000, contract, storage, conseiljs.TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();

```
<!-- tabs:end -->

The results: [`opAWf95rPHjognVGXtcpwjZa9RyXsgFAckbRiXuQcNVguVDBR8W`](https://alphanet.tzscan.io/opAWf95rPHjognVGXtcpwjZa9RyXsgFAckbRiXuQcNVguVDBR8W). The new contract address is [KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY](https://alphanet.tzscan.io/KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY)

#### Invoke a Contract

Similarly to contract deployment, contract invocation can happen either with Michelson or Micheline format. There is also a convenience function for safety that allows calling a contract with a 0 amount and no parameters. This was the invocation pattern for the Tezos Foundation [Ledger Nano S giveaway](https://tezos.foundation/news/tezos-foundation-to-give-away-ledger-nano-s-hardware-wallets-to-celebrate-one-year-since-betanet-launch) [registry contract](https://arronax-beta.cryptonomic.tech?e=Tezos%20Mainnet/operations&q=eyJmaWVsZHMiOlsidGltZXN0YW1wIiwiYmxvY2tfbGV2ZWwiLCJzb3VyY2UiLCJkZXN0aW5hdGlvbiIsImFtb3VudCIsImtpbmQiLCJmZWUiLCJvcGVyYXRpb25fZ3JvdXBfaGFzaCJdLCJwcmVkaWNhdGVzIjpbeyJmaWVsZCI6ImtpbmQiLCJvcGVyYXRpb24iOiJlcSIsInNldCI6WyJ0cmFuc2FjdGlvbiJdLCJpbnZlcnNlIjpmYWxzZX0seyJmaWVsZCI6InRpbWVzdGFtcCIsIm9wZXJhdGlvbiI6ImFmdGVyIiwic2V0IjpbMTU1OTM2MTYwMDAwMF0sImludmVyc2UiOmZhbHNlfSx7ImZpZWxkIjoiZGVzdGluYXRpb24iLCJvcGVyYXRpb24iOiJlcSIsInNldCI6WyJLVDFCUnVkRlpFWExZQU5nbVpUa2ExeENETjVuV1RNV1k3U1oiXSwiaW52ZXJzZSI6ZmFsc2V9LHsiZmllbGQiOiJ0aW1lc3RhbXAiLCJvcGVyYXRpb24iOiJiZWZvcmUiLCJzZXQiOlsxNTYzMjQ5NjAwMDAwXSwiaW52ZXJzZSI6ZmFsc2V9LHsiZmllbGQiOiJzdGF0dXMiLCJvcGVyYXRpb24iOiJlcSIsInNldCI6WyJhcHBsaWVkIl0sImludmVyc2UiOmZhbHNlfV0sIm9yZGVyQnkiOlt7ImZpZWxkIjoidGltZXN0YW1wIiwiZGlyZWN0aW9uIjoiYXNjIn1dLCJsaW1pdCI6NTAwMH0).

<!-- tabs:start -->
##### **Typescript**

```typescript
import { StoreType, TezosNodeWriter, TezosParameterFormat, setLogLevel } from 'conseiljs';

setLogLevel('debug');

const tezosNode = '';

async function invokeContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000, '"Cryptonomicon"', , TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

invokeContract();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

conseiljs.setLogLevel('debug');

async function invokeContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000, '"Cryptonomicon"', , conseiljs.TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

invokeContract();
```
<!-- tabs:end -->

The results: [`op8WNZqeWRxDHxTWRXroGmbDTEJvcBPbcXxPvmmg7KsDVeq5mnc`](https://alphanet.tzscan.io/op8WNZqeWRxDHxTWRXroGmbDTEJvcBPbcXxPvmmg7KsDVeq5mnc).

<!-- tabs:start -->
##### **Typescript**

```typescript
import { StoreType, TezosNodeWriter, TezosParameterFormat, setLogLevel } from 'conseiljs';

setLogLevel('debug');

const tezosNode = '';

async function invokeContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000, '{"string": "Cryptonomicon"}', TezosParameterFormat.Micheline);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

invokeContract();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

conseiljs.setLogLevel('debug');

async function invokeContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000, '{"string": "Cryptonomicon"}', conseiljs.TezosParameterFormat.Micheline);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

invokeContract();
```
<!-- tabs:end -->

<!-- tabs:start -->
##### **Typescript**

```typescript
import { StoreType, TezosNodeWriter, setLogLevel } from 'conseiljs';

setLogLevel('debug');

const tezosNode = '';

async function pingContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await TezosNodeWriter.sendContractPing(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

pingContract();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

conseiljs.setLogLevel('debug');

async function pingContract() {
    const keystore = {
        publicKey: 'edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG',
        privateKey: 'edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB',
        publicKeyHash: 'tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await conseiljs.TezosNodeWriter.sendContractPing(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

pingContract();
```
<!-- tabs:end -->

### Tezos Chain Operations with Hardware Devices

ConseilJS supports transaction signing with [Ledger Nano S](https://shop.ledger.com/products/ledger-nano-s) devices. The interactions are largely the same as with software-signed operations. This functionality is encapsulated in the `TezosLedgerWallet` namespace. Before a Ledger-bound account can be used, it must be unlocked as described below. After that, retrieve and cache the account address, finally to sign transactions with the Ledger, pass the `derivationPath` parameter to the various interaction functions.

#### Unlock an Account

<!-- tabs:start -->
##### **Typescript**

```typescript
import { HardwareDeviceType, TezosLedgerWallet, setLogLevel } from 'conseiljs';

setLogLevel('debug');

async function unlockAccount(derivationPath) {
    const keyStore = await TezosLedgerWallet.unlockAddress(HardwareDeviceType.LedgerNanoS, derivationPath);

    console.log(`Unlocked Ledger account at ${derivationPath} as ${keyStore.publicKeyHash}`);
}

unlockAccount("44'/1729'/0'/0'/0'");
```

##### **JavaScript (node)**

```javascript
const conseiljs = require('conseiljs');

conseiljs.setLogLevel('debug');

async function unlockAccount(derivationPath) {
    const keyStore = await conseiljs.TezosLedgerWallet.unlockAddress(conseiljs.HardwareDeviceType.LedgerNanoS, derivationPath);

    console.log(`Unlocked Ledger account at ${derivationPath} as ${keyStore.publicKeyHash}`);
}

unlockAccount("44'/1729'/0'/0'/0'");
```
<!-- tabs:end -->

#### Transfer Value

The difference between the code below and what was described earlier is the last parameter of the `sendTransactionOperation` function. The derivation path that needs to be invoked on the Ledger device to sign the transaction. The code also unlocks the account in this example. It is not necessary to do this every time an operation is sent to the chain, it's listed below for completeness. This is just one operation sample, all chain interactions with a Ledger device require a `derivationPath` parameter to be provided.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosNodeWriter, StoreType } from 'conseiljs';

const tezosNode = '';

async function sendTransaction(derivationPath: string) {
    const keyStore = await TezosLedgerWallet.unlockAddress(HardwareDeviceType.LedgerNanoS, derivationPath);

    const result = await TezosNodeWriter.sendTransactionOperation(tezosNode, keyStore, 'tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2', 500000, 1500, derivationPath);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

sendTransaction("44'/1729'/0'/0'/0'");
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

async function sendTransaction(derivationPath) {
    const keyStore = await TezosLedgerWallet.unlockAddress(HardwareDeviceType.LedgerNanoS, derivationPath);

    const result = await conseiljs.TezosNodeWriter.sendTransactionOperation(tezosNode, keyStore, 'tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2', 500000, 1500, derivationPath);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

sendTransaction("44'/1729'/0'/0'/0'");
```
<!-- tabs:end -->

### Metadata Discovery Functions

[Conseil](https://github.com/Cryptonomic/Conseil) blockchain indexer service is metadata-driven. Reports can be constructed in a fully dynamic fashion by discovering what a particular Conseil node has available. Unless you are running your own [Nautilus](https://github.com/Cryptonomic/Nautilus) instance, you'll need access to an existing one. Cryptonomic provides a small server for developers to try. Reach out on the [Riot Dev Channel](https://matrix.to/#/!rUwpbdwWhWgKINPyOD:cryptonomic.tech?via=cryptonomic.tech&via=matrix.org&via=ostez.com) for details.

All metadata functions are in the `ConseilMetadataClient` namespace. Internally all of these are REST GET requests. An `apiKey` header is required. The ConseilJS api takes care of these details. Each successive request relies on the results of the previous one. Using the information provide by this service it's possible to construct data queries discussed in the next section.

#### Platforms

Query for available platforms.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { ConseilMetadataClient } from 'conseiljs';
import * as util from 'util';

const conseilServerInfo = { url: '', apiKey: '' };

async function listPlatforms() {
    const platforms = await ConseilMetadataClient.getPlatforms(conseilServerInfo);
    console.log(`${util.inspect(platforms, false, 2, false)}`);
}

listPlatforms();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const util = require('util');
const conseilServerInfo = { url: '', apiKey: '' };

async function listPlatforms() {
    const platforms = await conseiljs.ConseilMetadataClient.getPlatforms(conseilServerInfo);
    console.log(`${util.inspect(platforms, false, 2, false)}`);
}

listPlatforms();
```
<!-- tabs:end -->

A result set may look like this:

```json
[ { "name": "tezos", "displayName": "Tezos" } ]
```

#### Networks

Query for networks under the `Tezos` platform.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { ConseilMetadataClient } from 'conseiljs';
import * as util from 'util';

const conseilServerInfo = { url: '', apiKey: '' };

async function listNetworks() {
    const platforms = await ConseilMetadataClient.getNetworks(conseilServerInfo, 'tezos');
    console.log(`${util.inspect(platforms, false, 2, false)}`);
}

listNetworks();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const util = require('util');
const conseilServerInfo = { url: '', apiKey: '' };

async function listNetworks() {
    const platforms = await conseiljs.ConseilMetadataClient.getNetworks(conseilServerInfo, 'tezos');
    console.log(`${util.inspect(platforms, false, 2, false)}`);
}

listNetworks();
```
<!-- tabs:end -->

The service might return:

```json
[ { "name": "zeronet", "displayName": "Zeronet", "platform": "tezos", "network": "zeronet" },
  { "name": "alphanet", "displayName": "Alphanet", "platform": "tezos", "network": "alphanet" } ]
```

#### Entities

Query for available chain entities on `Tezos` `alphanet`.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { ConseilMetadataClient } from 'conseiljs';
import * as util from 'util';

const conseilServerInfo = { url: '', apiKey: '' };

async function listEntities() {
    const platforms = await ConseilMetadataClient.getEntities(conseilServerInfo, 'tezos', 'alphanet');
    console.log(`${util.inspect(platforms, false, 2, false)}`);
}

listEntities();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const util = require('util');
const conseilServerInfo = { url: '', apiKey: '' };

async function listEntities() {
    const platforms = await conseiljs.ConseilMetadataClient.getEntities(conseilServerInfo, 'tezos', 'alphanet');
    console.log(`${util.inspect(platforms, false, 2, false)}`);
}

listEntities();
```
<!-- tabs:end -->

We might get:

```json
[ { "name": "accounts", "displayName": "Accounts", "count": 18782 },
  { "name": "accounts_checkpoint", "displayName": "Accounts checkpoint", "count": 15 },
  { "name": "bakers", "displayName": "Bakers", "count": 7588390 },
  { "name": "balance_updates", "displayName": "Balance updates", "count": 7352650 },
  { "name": "ballots", "displayName": "Ballots", "count": 0 },
  { "name": "blocks", "displayName": "Blocks", "count": 288222 },
  { "name": "fees", "displayName": "Fees", "count": 1183 },
  { "name": "operation_groups", "displayName": "Operation groups", "count": 2156141 },
  { "name": "operations", "displayName": "Operations", "count": 2179936 },
  { "name": "proposals", "displayName": "Proposals", "count": 0 } ]
```

#### Entity Attributes

Entities can be queried for their properties as follows.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { ConseilMetadataClient } from 'conseiljs';
import * as util from 'util';

const conseilServerInfo = { url: '', apiKey: '' };

async function listAttributes() {
    const platforms = await ConseilMetadataClient.getAttributes(conseilServerInfo, 'tezos', 'alphanet', 'operations');
    console.log(`${util.inspect(platforms, false, 2, false)}`);
}

listAttributes();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const util = require('util');
const conseilServerInfo = { url: '', apiKey: '' };

async function listAttributes() {
    const platforms = await conseiljs.ConseilMetadataClient.getAttributes(conseilServerInfo, 'tezos', 'alphanet', 'operations');
    console.log(`${util.inspect(platforms, false, 2, false)}`);
}

listAttributes();
```
<!-- tabs:end -->

A result may look like this. The sample has been truncated for size.

```json
[ { "name": "operation_id", "displayName": "Operation id", "dataType": "Int", "keyType": "UniqueKey", "entity": "operations" },
 { "name": "operation_group_hash", "displayName": "Operation group hash", "dataType": "String", "cardinality": 2147676, "keyType": "NonKey", "entity": "operations" },
 { "name": "kind", "displayName": "Kind", "dataType": "String", "cardinality": 8, "keyType": "NonKey", "entity": "operations" },
 { "name": "level", "displayName": "Level", "dataType": "Int", "keyType": "NonKey", "entity": "operations" },
 { "name": "delegate", "displayName": "Delegate", "dataType": "String", "cardinality": 133, "keyType": "NonKey", "entity": "operations" },
 { "name": "slots", "displayName": "Slots", "dataType": "String", "cardinality": 690305, "keyType": "NonKey", "entity": "operations" },
 { "name": "nonce", "displayName": "Nonce", "dataType": "String", "cardinality": 8889, "keyType": "NonKey", "entity": "operations" },
 { "name": "pkh", "displayName": "Pkh", "dataType": "String", "cardinality": 1532, "keyType": "NonKey", "entity": "operations" },
 { "name": "secret", "displayName": "Secret", "dataType": "String", "cardinality": 1532, "keyType": "NonKey", "entity": "operations" },
 { "name": "source", "displayName": "Source", "dataType": "String", "cardinality": 2254, "keyType": "UniqueKey", "entity": "operations" },
 { "name": "fee", "displayName": "Fee", "dataType": "Decimal", "keyType": "NonKey", "entity": "operations" }
 ...
]
```

#### Attribute Values

The metadata services provides distinct values for some low-cardinality fields. In this case we're querying for `operation` `kind` on `Tezos` `alphanet`.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { ConseilMetadataClient } from 'conseiljs';
import * as util from 'util';

const conseilServerInfo = { url: '', apiKey: '' };

async function listAttributeValues() {
    const platforms = await ConseilMetadataClient.getAttributeValues(conseilServerInfo, 'tezos', 'alphanet', 'operations', 'kind');
    console.log(`${util.inspect(platforms, false, 2, false)}`);
}

listAttributeValues();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const util = require('util');
const conseilServerInfo = { url: '', apiKey: '' };

async function listAttributeValues() {
    const platforms = await conseiljs.ConseilMetadataClient.getAttributeValues(conseilServerInfo, 'tezos', 'alphanet', 'operations', 'kind');
    console.log(`${util.inspect(platforms, false, 2, false)}`);
}

listAttributeValues();
```
<!-- tabs:end -->

Result here is:

```json
[ "seed_nonce_revelation", "delegation", "transaction", "activate_account", "origination", "reveal", "double_baking_evidence", "endorsement" ]
```

This information can be used to create a drop-down list in some UI, or allow for type-ahead-autocomplete, etc. If the returned list is too long to be useful, or to get partial matches on high-cardinality fields, see getAttributeValuesForPrefix.

#### Attribute Values for Prefix

For long lists that may not be practical to display in a UI for auto-complete or for fields that the server will not provide attribute lists due to limits on cardinality, use `getAttributeValuesForPrefix(serverInfo, platform, network, entity, attribute, prefix)`. The last parameter of this call should be a few characters long to be effective.

### Reporting &amp; Analytics Functions

For the Tezos chain these methods are in the `TezosConseilClient` namespace, in addition to `apiKey`, `Content-Type=application/json` header must be present. All data requests are REST POST.

#### List transactions for an address

Notice that it is possible to sort on and filter by fields that are not returned in the result set. Sent and received transactions must be queried for separately. Same address is used as an example: `tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z`.

<!-- tabs:start -->

##### **Typescript**

```typescript
import { ConseilDataClient, ConseilQueryBuilder, ConseilSortDirection, ConseilOperator } from 'conseiljs';
import * as util from 'util';

const platform = 'tezos';
const network = 'alphanet';
const entity = 'operations';

const conseilServer = { url: '', apiKey: '' };

async function listAccountTransactions() {
    let sendQuery = ConseilQueryBuilder.blankQuery();
    sendQuery = ConseilQueryBuilder.addFields(sendQuery, 'block_level', 'timestamp', 'source', 'destination', 'amount', 'fee', 'counter');
    sendQuery = ConseilQueryBuilder.addPredicate(sendQuery, 'kind', ConseilOperator.EQ, ['transaction'], false);
    sendQuery = ConseilQueryBuilder.addPredicate(sendQuery, 'source', ConseilOperator.EQ, ['tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z'], false);
    sendQuery = ConseilQueryBuilder.addPredicate(sendQuery, 'status', ConseilOperator.EQ, ['applied'], false);
    sendQuery = ConseilQueryBuilder.addOrdering(sendQuery, 'block_level', ConseilSortDirection.DESC);
    sendQuery = ConseilQueryBuilder.setLimit(sendQuery, 100);

    let receiveQuery = ConseilQueryBuilder.blankQuery();
    receiveQuery = ConseilQueryBuilder.addFields(receiveQuery, 'block_level', 'timestamp', 'source', 'destination', 'amount', 'fee', 'counter');
    receiveQuery = ConseilQueryBuilder.addPredicate(receiveQuery, 'kind', ConseilOperator.EQ, ['transaction'], false);
    receiveQuery = ConseilQueryBuilder.addPredicate(receiveQuery, 'destination', ConseilOperator.EQ, ['tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z'], false);
    receiveQuery = ConseilQueryBuilder.addPredicate(receiveQuery, 'status', ConseilOperator.EQ, ['applied'], false);
    receiveQuery = ConseilQueryBuilder.addOrdering(receiveQuery, 'block_level', ConseilSortDirection.DESC);
    receiveQuery = ConseilQueryBuilder.setLimit(receiveQuery, 100);

    const sendResult = await ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, sendQuery);
    const receiveResult = await ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, receiveQuery);
    const transactions = sendResult.concat(receiveResult).sort((a, b) => { return a['timestamp'] - b['timestamp'] });

    console.log(`${util.inspect(transactions, false, 2, false)}`);
}

listAccountTransactions();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const util = require('util');
const platform = 'tezos';
const network = 'alphanet';
const entity = 'operations';

const conseilServer = { url: '', apiKey: '' };

async function listAccountTransactions() {
    let sendQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    sendQuery = conseiljs.ConseilQueryBuilder.addFields(sendQuery, 'block_level', 'timestamp', 'source', 'destination', 'amount', 'fee', 'counter');
    sendQuery = conseiljs.ConseilQueryBuilder.addPredicate(sendQuery, 'kind', conseiljs.ConseilOperator.EQ, ['transaction'], false);
    sendQuery = conseiljs.ConseilQueryBuilder.addPredicate(sendQuery, 'source', conseiljs.ConseilOperator.EQ, ['tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z'], false);
    sendQuery = conseiljs.ConseilQueryBuilder.addPredicate(sendQuery, 'status', conseiljs.ConseilOperator.EQ, ['applied'], false);
    sendQuery = conseiljs.ConseilQueryBuilder.addOrdering(sendQuery, 'block_level', conseiljs.ConseilSortDirection.DESC);
    sendQuery = conseiljs.ConseilQueryBuilder.setLimit(sendQuery, 100);

    let receiveQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    receiveQuery = conseiljs.ConseilQueryBuilder.addFields(receiveQuery, 'block_level', 'timestamp', 'source', 'destination', 'amount', 'fee', 'counter');
    receiveQuery = conseiljs.ConseilQueryBuilder.addPredicate(receiveQuery, 'kind', conseiljs.ConseilOperator.EQ, ['transaction'], false);
    receiveQuery = conseiljs.ConseilQueryBuilder.addPredicate(receiveQuery, 'destination', conseiljs.ConseilOperator.EQ, ['tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z'], false);
    receiveQuery = conseiljs.ConseilQueryBuilder.addPredicate(receiveQuery, 'status', conseiljs.ConseilOperator.EQ, ['applied'], false);
    receiveQuery = conseiljs.ConseilQueryBuilder.addOrdering(receiveQuery, 'block_level', conseiljs.ConseilSortDirection.DESC);
    receiveQuery = conseiljs.ConseilQueryBuilder.setLimit(receiveQuery, 100);

    const sendResult = await conseiljs.ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, sendQuery);
    const receiveResult = await conseiljs.ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, receiveQuery);
    const transactions = sendResult.concat(receiveResult).sort((a, b) => { return a['timestamp'] - b['timestamp'] });

    console.log(`${util.inspect(transactions, false, 2, false)}`);
}

listAccountTransactions();
```
<!-- tabs:end -->

A result of that request might look like this.

```json
[ { "source": "tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z",
    "timestamp": 1554614628000,
    "block_level": 286240,
    "amount": 500000,
    "counter": 36041,
    "destination": "tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2",
    "fee": 1500 } ]
```

#### List transactions within a date range

This query will return all successful transactions in the last four hours.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { ConseilDataClient, ConseilQueryBuilder, ConseilSortDirection, ConseilOperator } from 'conseiljs';
import * as util from 'util';

const platform = 'tezos';
const network = 'alphanet';
const entity = 'operations';

const conseilServer = { url: '', apiKey: '' };

async function listTransactions() {
    let transactionQuery = ConseilQueryBuilder.blankQuery();
    transactionQuery = ConseilQueryBuilder.addFields(transactionQuery, 'block_level', 'timestamp', 'source', 'destination', 'amount', 'fee', 'counter');
    transactionQuery = ConseilQueryBuilder.addPredicate(transactionQuery, 'kind', ConseilOperator.EQ, ['transaction'], false);
    transactionQuery = ConseilQueryBuilder.addPredicate(transactionQuery, 'timestamp', ConseilOperator.BETWEEN, [Date.now() - 3600 * 48, Date.now()], false);
    transactionQuery = ConseilQueryBuilder.addPredicate(transactionQuery, 'status', ConseilOperator.EQ, ['applied'], false);
    transactionQuery = ConseilQueryBuilder.addOrdering(transactionQuery, 'block_level', ConseilSortDirection.DESC);
    transactionQuery = ConseilQueryBuilder.setLimit(transactionQuery, 5000);

    const result = await ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, transactionQuery);

    console.log(`${util.inspect(result, false, 2, false)}`);
}

listTransactions();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const util = require('util');
const platform = 'tezos';
const network = 'alphanet';
const entity = 'operations';

const conseilServer = { url: '', apiKey: '' };

async function listTransactions() {
    let transactionQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    transactionQuery = conseiljs.ConseilQueryBuilder.addFields(transactionQuery, 'block_level', 'timestamp', 'source', 'destination', 'amount', 'fee', 'counter');
    transactionQuery = conseiljs.ConseilQueryBuilder.addPredicate(transactionQuery, 'kind', conseiljs.ConseilOperator.EQ, ['transaction'], false);
    transactionQuery = conseiljs.ConseilQueryBuilder.addPredicate(transactionQuery, 'timestamp', conseiljs.ConseilOperator.BETWEEN, [Date.now() - 3600 * 48, Date.now()], false);
    transactionQuery = conseiljs.ConseilQueryBuilder.addPredicate(transactionQuery, 'status', conseiljs.ConseilOperator.EQ, ['applied'], false);
    transactionQuery = conseiljs.ConseilQueryBuilder.addOrdering(transactionQuery, 'block_level', conseiljs.ConseilSortDirection.DESC);
    transactionQuery = conseiljs.ConseilQueryBuilder.setLimit(transactionQuery, 5000);

    const result = await conseiljs.ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, transactionQuery);

    console.log(`${util.inspect(result, false, 2, false)}`);
}

listTransactions();
```
<!-- tabs:end -->

#### List all originated accounts

#### List all managed accounts

#### List all smart contracts

#### List top-10 bakers by balance

#### List top-10 bakers by delegator count

#### Export a large dataset to csv

### Common Wallet Queries

#### Tezos Implicit Account Information

<!-- tabs:start -->
##### **Typescript**

```typescript
import { ConseilDataClient, ConseilQueryBuilder, ConseilSortDirection, ConseilOperator } from 'conseiljs';
import * as util from 'util';

const platform = 'tezos';
const network = 'alphanet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '' };

async function accountInfo(address: string) {
    let accountQuery = ConseilQueryBuilder.blankQuery();
    accountQuery = ConseilQueryBuilder.addFields(accountQuery, 'account_id', 'manager', 'delegate_value', 'balance', 'block_level');
    accountQuery = ConseilQueryBuilder.addPredicate(accountQuery, 'account_id', ConseilOperator.EQ, [address], false);
    accountQuery = ConseilQueryBuilder.setLimit(accountQuery, 1);

    const result = await ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, accountQuery);

    console.log(`${util.inspect(result, false, 2, false)}`);
}

accountInfo('tz3WXYtyDUNL91qfiCJtVUX746QpNv5i5ve5');
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const util = require('util');
const platform = 'tezos';
const network = 'alphanet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '' };

async function accountInfo(address: string) {
    let accountQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    accountQuery = conseiljs.ConseilQueryBuilder.addFields(accountQuery, 'account_id', 'manager', 'delegate_value', 'balance', 'block_level');
    accountQuery = conseiljs.ConseilQueryBuilder.addPredicate(accountQuery, 'account_id', conseiljs.ConseilOperator.EQ, [address], false);
    accountQuery = conseiljs.ConseilQueryBuilder.setLimit(accountQuery, 1);

    const result = await conseiljs.ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, accountQuery);

    console.log(`${util.inspect(result, false, 2, false)}`);
}

accountInfo('tz3WXYtyDUNL91qfiCJtVUX746QpNv5i5ve5');
```
<!-- tabs:end -->

#### Delegated Accounts with non-zero Balances

<!-- tabs:start -->

##### **Typescript**

```typescript
import { ConseilDataClient, ConseilQueryBuilder, ConseilSortDirection, ConseilOperator } from 'conseiljs';
import * as util from 'util';

const platform = 'tezos';
const network = 'alphanet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '' };

async function accountInfo(address: string) {
    let accountQuery = ConseilQueryBuilder.blankQuery();
    accountQuery = ConseilQueryBuilder.addFields(accountQuery, 'account_id');
    accountQuery = ConseilQueryBuilder.addPredicate(accountQuery, 'manager', ConseilOperator.EQ, [address]);
    accountQuery = ConseilQueryBuilder.addPredicate(accountQuery, 'delegate_value', ConseilOperator.ISNULL, [], true);
    accountQuery = ConseilQueryBuilder.addPredicate(accountQuery, 'balance', ConseilOperator.GT, [0]);
    accountQuery = ConseilQueryBuilder.setLimit(accountQuery, 100);

    const result = await ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, accountQuery);

    console.log(`${util.inspect(result, false, 2, false)}`);
}

accountInfo('tz1PziRyFwu96Rw1vqgzEdd7SqMuT4hQaggz');
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const util = require('util');
const platform = 'tezos';
const network = 'alphanet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '' };

async function accountInfo(address: string) {
    let accountQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    accountQuery = conseiljs.ConseilQueryBuilder.addFields(accountQuery, 'account_id');
    accountQuery = conseiljs.ConseilQueryBuilder.addPredicate(accountQuery, 'manager', conseiljs.ConseilOperator.EQ, [address]);
    accountQuery = conseiljs.ConseilQueryBuilder.addPredicate(accountQuery, 'delegate_value', conseiljs.ConseilOperator.ISNULL, [], true);
    accountQuery = conseiljs.ConseilQueryBuilder.addPredicate(accountQuery, 'balance', conseiljs.ConseilOperator.GT, [0]);
    accountQuery = conseiljs.ConseilQueryBuilder.setLimit(accountQuery, 100);

    const result = await conseiljs.ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, accountQuery);

    console.log(`${util.inspect(result, false, 2, false)}`);
}

accountInfo('tz1PziRyFwu96Rw1vqgzEdd7SqMuT4hQaggz');
```
<!-- tabs:end -->

#### Total Balance for an Account

This query returns the complete holdings under the control of the provided account.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { ConseilDataClient, ConseilQueryBuilder, ConseilSortDirection, ConseilOperator } from 'conseiljs';
import * as util from 'util';

const platform = 'tezos';
const network = 'alphanet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '' };

async function accountBalance(address: string) {
    let accountQuery = ConseilQueryBuilder.blankQuery();
    accountQuery = ConseilQueryBuilder.addFields(accountQuery, 'manager', 'balance');
    accountQuery = ConseilQueryBuilder.addPredicate(accountQuery, 'manager', ConseilOperator.EQ, [address]);
    accountQuery = ConseilQueryBuilder.addPredicate(accountQuery, 'balance', ConseilOperator.GT, [0]);
    accountQuery = ConseilQueryBuilder.addAggregationFunction(accountQuery, 'balance', ConseilFunction.sum);
    accountQuery = ConseilQueryBuilder.setLimit(accountQuery, 1);

    const result = await ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, accountQuery);

    console.log(`${util.inspect(result, false, 2, false)}`);
}

accountBalance('tz1aQuhhKCvjFZ4XbnvTU5BjaBiz3ceoMNag');
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const util = require('util');

const platform = 'tezos';
const network = 'alphanet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '' };

async function accountBalance(address) {
    let accountQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    accountQuery = conseiljs.ConseilQueryBuilder.addFields(accountQuery, 'manager', 'balance');
    accountQuery = conseiljs.ConseilQueryBuilder.addPredicate(accountQuery, 'manager', conseiljs.ConseilOperator.EQ, [address]);
    accountQuery = conseiljs.ConseilQueryBuilder.addPredicate(accountQuery, 'balance', conseiljs.ConseilOperator.GT, [0]);
    accountQuery = conseiljs.ConseilQueryBuilder.addAggregationFunction(accountQuery, 'balance', conseiljs.ConseilFunction.sum);
    accountQuery = conseiljs.ConseilQueryBuilder.setLimit(accountQuery, 1);

    const result = await conseiljs.ConseilDataClient.executeEntityQuery(conseilServer, platform, network, entity, accountQuery);

    console.log(`${util.inspect(result, false, 2, false)}`);
}

accountBalance('tz1aQuhhKCvjFZ4XbnvTU5BjaBiz3ceoMNag');

```
<!-- tabs:end -->

### Namespaces

#### ConseilQueryBuilder

This collection of methods crates entity queries.

##### blankQuery()

This method creates a minimum viable query that can be sent a Conseil data service like `TezosConseilClient`.

##### addFields(query, ...fields)

By default, all fields are returned, but using the information from the ConseilMetadataClient for the appropriate platform/network/entity combination.

##### addPredicate(query, field, operation, values, invert)

Several predicate operations are supported. For string values: `EQ`, `IN`, `LIKE`, `STARTSWITH`, `ENDSWITH`, `ISNULL`. For numbers and dates: `EQ`, `IN`, `BETWEEN`, `LT` or `BEFORE`, `GT` or `AFTER`, `ISNULL`. The operation values are located in the `ConseilOperator` enum. The difference between `LIKE` and `STARTSWITH` and `ENDSWITH`, is that the former will do a match at any point in the text.

There are limitations on the contents of the values array depending on the supplied operation. `EQ` requires a single value, `IN` an contain multiple, `BETWEEN` only accepts two.

The last parameter is to allow for queries like `not in`, or `is not null`, `!=`. Default is `false`.

##### addOrdering(query, field, direction)

One or more ordering instructions can be added to a query and they may be applied on fields that are not part of the result set.

The default direction is `ASC`. Direction values are in the `ConseilSortDirection` enum.

##### setLimit(query, limit)

The default record set is 100 rows. This can be changed using this method, however the server may override the request.

##### setOutputType(query, outputType)

By default, the service will return json data. For large datasets this is suboptimal. This function sets the output parameter of the ConseilQuery to one of 'json' or 'csv' as defined in `ConseilOutput` enum.

##### addAggregationFunction(query, field, aggregationFunction)

It is possible to apply an aggregation function to a field in the query. This field must be present in the `fields` collection. The aggregation function is one of `avg`, `count`, `max`, `min`, `sum` as defined in the `ConseilFunction` enum. `count` can be applied to any field type; `max`, `min` can be applied to a datetime or numeric fields, while `avg` and `sum` are only valid on numeric fields.

#### ConseilMetadataClient

For details, see [API Examples](#metadata-discovery-functions) below.

#### ConseilDataClient

#### TezosConseilClient

Functions for querying the Conseil back-end REST API v2 for Tezos. This functionality is offered by wrapping ConseilDataClient for Tezos-specific entities.

All of these methods require Conseil connection object which is a URL and API key. The `serverInfo` parameter below is of type `ConseilServerInfo`. Some of the methods also take a `query` parameter of type `ConseilQuery`, these are best constructed with `ConseilQueryBuilder` described [earlier](#ConseilQueryBuilder).

##### getBlockHead(serverInfo, network)

Returns the most recent block on the chain for a given `network`. Internally this is implemented with a `ConseilQuery` ordered by block level with limit 1. All block entity fields are returned. To get just a subset of fields, use `getBlocks(serverInfo, network, query)`.

##### getBlock(serverInfo, network, hash)

Returns a specific block with the given `hash` and `network`. All block entity fields are returned. To get just a subset of fields, use `getBlocks(serverInfo, network, query)`.

##### getBlockByLevel(serverInfo, network level)

Returns a specific block at the provided `level` from the `network`. All block entity fields are returned.

##### getAccount(serverInfo, network, accountID)

Returns a specific account on the given `network` with the provided `accountID`. In Tezos account id, account address, public key hash (phk) all refer to the same thing. All account entity fields are returned. To get just a subset of fields, use `getAccounts(serverInfo, network, query)`.

##### getOperationGroup(serverInfo, network, operationGroupID)

Returns a specific operation group on the given `network` with the provided `operationGroupID`. In Tezos individual operations are not keyed. All operation group entity fields are returned. To get just a subset of fields, use `getOperationGroups(serverInfo, network, query)`.

##### getBlocks(serverInfo, network, query)

Returns block information subject to the provided `query` on a given `network`.

##### getAccounts(serverInfo, network, query)

Returns account information subject to the provided `query` on a given `network`.

##### getOperationGroups(serverInfo, network, query)

Returns operation group information subject to the provided `query` on a given `network`.

##### getOperations(serverInfo, network, query)

Returns operation information subject to the provided `query` on a given `network`.

##### getProposals(serverInfo, network, query)

Returns proposal information subject to the provided `query` on a given `network`.

##### getBakers(serverInfo, network, query)

Returns baker information subject to the provided `query` on a given `network`.

##### getBallots(serverInfo, network, query)

Returns ballot information subject to the provided `query` on a given `network`.

##### getFeeStatistics(serverInfo, network, operationType)

Conseil indexer calculates running average fees by operation type. This is a convenience method to get that information. [Tezori](https://github.com/Cryptonomic/Tezori/blob/master/app/utils/general.js#L168) for example uses this information to suggest an appropriate fee to the user via a drop-down.

##### awaitOperationConfirmation(serverInfo, network, hash, duration)

This function will monitor the chain for an operation with the given `hash` for up a `duration` blocks on some `network`. If the operation is found, it will be returned, otherwise an `Error` is thrown.

##### getEntityQueryForId(id)

A conveniences function that enabled dynamic id-based search. For a specified `id`, it returns the entity type and a query necessary to get it from the service. Numeric ids are assumed to be block level.

#### TezosLedgerWallet

Identity management and signing functions to enable Tezos node interactions with the Ledger Nano S hardware wallet.

##### initLedgerTransport

Before the Ledger device can be used, the connection must be initialized with this call.

##### unlockAddress(deviceType, derivationPath)

Returns a partial `KeyStore` container public key and public key hash (address) for a given `derivationPath`. The private key does not leave the device. `deviceType` must be `HardwareDeviceType.LedgerNanoS`.

##### getTezosPublicKey(derivationPath: string): Promise<string> 

Returns just the public key for a given `derivationPath`.

##### signTezosOperation(derivationPath, watermarkedOpInHex)

Returns signature bytes resulting from signing the provided transaction expressed in bytes using the private key at the specified `derivationPath`.

#### TezosMessageCodec

A collection of functions to encode and decode various Tezos P2P message components

#### TezosNodeReader

Utility functions for interacting with the Tezos node.

##### getBlock(server: string, hash: string)

Gets a block directly from the specified Tezos node by block hash.

##### getBlockHead(server: string)

Gets the most-recent block.

##### getAccountForBlock(server: string, blockHash: string, accountHash: string)

Returns account status as of a specific block.

##### getCounterForAccount(server: string, accountHash: string)

Gets the current account operation counter. This index must be incremented with each successive operation being submitted by the account.

##### getAccountManagerForBlock(server: string, blockHash: string, accountHash: string)

Retrieves the account manager information as of a given block.

##### isImplicitAndEmpty(server: string, accountHash: string)

Identifies the account as implicit and empty - 0 balance. This has bearing on the cost of certain transactions.

##### isManagerKeyRevealedForAccount(server: string, accountHash: string)

A key reveal operation is required, this verifies if the account has already sent one.

#### TezosNodeWriter

Functions for sending operations on the Tezos network via a node. Most of these methods take many parameters that include server URL, key pair and address structure, and fee, among other things. Parameters have been omitted for brevity, but all of these methods and more are documented in the code using TSDoc.

Several of these functions accept an optional derivation path parameter that is defaulted to blank for signing with a Ledger device.

The various send functions return an operation group hash which can be passed to [TezosConseilClient.awaitOperationConfirmation(...)](#awaitOperationConfirmationserverInfo-network-hash-duration) to await its appearance on the chain.

##### signOperationGroup

Generates a signature for the hex representation of the proposed operation group based on account keys.

##### forgeOperations

Forges an operation group - converts it to hex in preparation for inclusion on the chain. This function will encode operations locally.

##### forgeOperationsRemotely

ConseilJS is able to encode locally operations in many cases, for the occasions where that fails, this function will forge an operation remotely on the specified Tezos node. This operation is not trustless.

##### applyOperation

Sends the operation group to the Tezos node for validation. The RPC payload is JSON, but the attached signature is based on the (potentially) locally created hex equivalent.

##### injectOperation

Submits the binary content of the operation group for inclusion on the chain.

##### sendOperation

Assembles, signs, forges, validates and submits an operation group to the chain.

##### appendRevealOperation

Account public key must be revealed for it to participate in transactions. This method will check the account status and add a Reveal operation to the operation group going out.

##### sendTransactionOperation

Sends the basic value transfer operation.

##### sendDelegationOperation

Updates the account's delegate.

##### sendUndelegationOperation

A convenience function to remove the delegate from an account. Calls [sendDelegationOperation](#sendDelegationOperation) internally

##### sendAccountOriginationOperation

Creates an originated account (KT1), without a script. These types of accounts allow participation in the delegation process.

##### sendContractOriginationOperation

Attempts to deploy a contract on the chain. `code` and initial `storage` are required parameters the content of which is specified by `codeFormat`. For operation submission Tezos converts the Michelson code into a JSON format known as Micheline before finally writing it as hex. Setting `codeFormat` to 'Micheline' will skip the Michelson-Micheline conversion.

##### sendContractInvocationOperation

Like [sendContractOriginationOperation](#sendContractOriginationOperation), parameters can be in Michelson or Micheline. It's possible to pass undefined or blank parameters.

##### sendContractPing

Invokes a contract with a 0 transaction amount and no parameters.

##### sendKeyRevealOperation

A key reveal operation can be sent separately as well. For a more efficient way to reveal an account, see [appendRevealOperation](#appendRevealOperation).

##### sendIdentityActivationOperation

Sends an account activation operation. These are preformed for fundraiser accounts.

#### TezosFileWallet

Functions for Tezos wallet functionality.

#### TezosChainTypes

#### TezosP2PMessageTypes

JSON message definitions for operation submission.

#### TezosRPCResponseTypes

JSON message definitions for RPC service responses.

## Contribute

There are many ways to contribute to this project. You can develop applications or dApps with it. You can submit bug reports or feature requests. You can ask questions about it on [r/Tezos](http://reddit.com/r/tezos/) or the [Tezos StackExchange](https://tezos.stackexchange.com). We certainly welcome pull requests as well.

### Known Issues

- Some of the P2P messages are not implemented, specifically those used in baking operations.

### Dependency Requirements

- AWS-SDK dependency must remain as the Ledger Connect feature requires it.

### NPM Target Overview

#### `npm run test`

#### `npm run coverage`

#### `npm run format`

## Other references

[Wiki](https://github.com/Cryptonomic/ConseilJS/wiki/Tutorial:-Querying-for-Tezos-alphanet-data-using-the-ConseilJS-v2-API)

[Riot Dev Channel](https://matrix.to/#/!rUwpbdwWhWgKINPyOD:cryptonomic.tech?via=cryptonomic.tech&via=matrix.org&via=ostez.com)

[Cryptonomic Reddit](https://www.reddit.com/r/cryptonomic)

[The Cryptonomic Aperiodical](https://medium.com/the-cryptonomic-aperiodical)

[@CryptonomicTech](https://twitter.com/CryptonomicTech)
