<!-- markdownlint-disable MD024 -->
# ConseilJS

[![npm version](https://img.shields.io/npm/v/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![npm](https://img.shields.io/npm/dm/conseiljs.svg)](https://www.npmjs.com/package/conseiljs)
[![Build Status](https://travis-ci.org/Cryptonomic/ConseilJS.svg?branch=master)](https://travis-ci.org/Cryptonomic/ConseilJS)
[![Coverage Status](https://coveralls.io/repos/github/Cryptonomic/ConseilJS/badge.svg?branch=master)](https://coveralls.io/github/Cryptonomic/ConseilJS?branch=master)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Cryptonomic_ConseilJS&metric=alert_status)](https://sonarcloud.io/dashboard?id=Cryptonomic_ConseilJS)
[![dependencies](https://david-dm.org/Cryptonomic/ConseilJS/status.svg)](https://david-dm.org/Cryptonomic/ConseilJS)

A library for building decentralized applications in Typescript and Javascript, currently focused on the [Tezos](http://tezos.com/) platform.

ConseilJS connects to Tezos nodes for live chain data and operations and to [Conseil](https://github.com/Cryptonomic/Conseil) servers for high-performance analytics on blockchain data. Internally, Cryptonomic uses [Nautilus](https://github.com/Cryptonomic/Nautilus) for infrastructure deployments of these services. This is the library at the core of our products, [Arronax](https://arronax.io), [Mininax](https://mininax.io) and certainly [Galleon](https://galleon-wallet.tech). There are [ReasonML bindings](https://github.com/Cryptonomic/ConseilJS-ReasonML-Bindings) as well.

Cryptonomic offers an infrastructure service - [Nautilus Cloud](https://nautilus.cloud) which enables quick access to the Tezos platform along with products that make it easier build on it.

## Other Resources

In addition to these materials, there is an [automated walk-through for common Tezos workflows](https://gist.github.com/anonymoussprocket/148d82fc9bf6c413be04155a90d57be6) available. The [Mininax](https://mininax.io) block explorer is handy for viewing operations submitted during that run. Cryptonomic holds regular dApp development workshops internationally, if you are interested in one, reach out to organize it. The materials for these events are continuously updated and [are available](https://medium.com/the-cryptonomic-aperiodical/blockchain-development-with-tezos-698aa930e50f) on [Medium](https://medium.com/the-cryptonomic-aperiodical).

## Use with Nodejs

Add our [NPM package](https://www.npmjs.com/package/conseiljs) to your project and a signing library. As of ConseilJS 5.0.0 cryptographic signing functionality is external to the core library. Further more, it is necessary to provide a logger and fetch references as specified below. This is done separately to allow use of [proxy-aware fetch](https://www.npmjs.com/package/socks5-node-fetch) for example.

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
logger.setLevel('debug', false); // to see only errors, set to 'error'
registerLogger(logger);
registerFetch(fetch);

let signer: Signer;
const keyStore = await KeyStoreUtils.restoreIdentityFromSecretKey('edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH');
signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'), -1);
```

## Use with Web

Unlike the nodejs sample, it's not possible to configure fetch or logger references for the web-based version of ConseilJS.

```html
<html>
<head>
    <script src="https://cdn.jsdelivr.net/gh/cryptonomic/conseiljs/dist-web/conseiljs.min.js"
        integrity="sha384-55ElSck0OR93XvRRLY9kqwLv1ueRL2O04duNhZwdPRAO1qFCqYwqASM7NFphWOhv"
        crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/gh/cryptonomic/conseiljs-softsigner/dist-web/conseiljs-softsigner.min.js"
        crossorigin="anonymous"></script>
    <script>
        const keyStore = await conseiljssoftsigner.KeyStoreUtils.restoreIdentityFromSecretKey('edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH');
        signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'), -1);
    </script>
</head>
<body>
    ...
</body>
</html>
```

If you're using the integrity check mechanism, make sure to keep the hash up to date. There reference above points at [ConseilJS trunk on GitHub](https://github.com/Cryptonomic/ConseilJS/blob/master/dist-web/conseiljs.min.js) and it is updated when new releases are made, which will make previous hashes invalid and render your webpage non-functional. For this reason, subsequent code samples do not include the `integrity` attribute.

## API Overview and Examples

### Contract Development Lightning Route

If you want to skip straight to working on Michelson smart contracts simply follow these instructions in the following order:

1. [Create node project](https://nodejs.org/en/docs/guides/getting-started-guide/)
2. [Install ConseilJS](#Use-with-Nodejs)
3. [Get an API key](#API-Key)
4. [Create a Tezos testnet account](#Create-an-Tezos-testnet-account)
5. [Initialize the account](#Initialize-the-account)
6. [Deploy a contract](#Deploy-a-Contract)
7. [Invoke a contract](#Invoke-a-Contract)

### Blockchain Analytics Lightning Route

If your interests lay in statistics and business intelligence, ConseilJS has tools for that as well. While for heavier data extraction using [Conseil](https://cryptonomic.github.io/Conseil) directly may make more sense, if you are building user tools like dashboards ConseilJS will make the process vastly easier.

1. [Create node project](https://nodejs.org/en/docs/guides/getting-started-guide/)
1. [Install ConseilJS](#Use-with-Nodejs)
1. [Get an API key](#API-Key)
1. [Run reports](#reporting--analytics-functions)

### API Key

Some ConseilJS functions require an API key for a Conseil service instance. While direct chain interactions happen via a Tezos node, Conseil read operations like those in `TezosConseilClient` namespace do require an API key.

Obtaining a development key is easy. Cryptonomic offers an infrastructure service - [Nautilus Cloud](https://nautilus.cloud) which enables quick access to the Tezos platform along with products that make it easier build on it.

### Tezos Chain Operations

To execute operations on the Tezos chain a link to a Tezos node is required. One can be found after logging into [Nautilus Cloud](https://nautilus.cloud) for both the current testnet and mainnet. Be sure to initialize the `tezosNode` variable accordingly. Interface to this functionality is in the `TezosNodeReader` and `TezosNodeWriter` namespaces. These operations do not need an API Key. ConseilJS can be used with any compatible Tezos node. "Compatible" in this case means running a specific protocol version. At the time of writing the mainnet protocol was P006, Carthage which is supported by ConseilJS 5.0.3 and later.

#### Create a Tezos testnet account

Visit the [Faucet](https://faucet.tzalpha.net) to get a test account with a healthy balance of fake XTZ to play with. With this information we can create the public and private keys necessary to participate in one of the test networks. Cryptonomic provides access to the Tezos **mainnet** and **carthagenet** (as of Q1 2020) networks via [Nautilus Cloud](https://nautilus.cloud). In the below examples, `faucetAccount` is assigned the contents of the file the faucet produces. Note that the `faucetAccount` used in these examples most-certainly will not work, please claim your own at the [faucet](https://faucet.tzalpha.net).

<!-- tabs:start -->
##### **Typescript**

```typescript
import { KeyStoreUtils } from 'conseiljs-softsigner';

const faucetAccount = {
    "mnemonic": [ "letter", "pair", "shuffle", "exotic", "sword", "west", "build", "monster", "future", "senior", "salt", "satisfy", "knock", "alert", "gorilla"],
    "secret": "0a09075426ab2658814c1faf101f53e5209a62f5",
    "amount": "5652123072",
    "pkh": "tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy",
    "password": "VvLbJMu1fF",
    "email": "yoyhmapi.ugewcsiv@tezos.example.org"
}

async function initAccount() {
    const keystore = await KeyStoreUtils.restoreIdentityFromFundraiser(faucetAccount.mnemonic.join(' '), faucetAccount.email, faucetAccount.password, faucetAccount.pkh);
    console.log(`public key: ${keystore.publicKey}`);
    console.log(`secret key: ${keystore.secretKey}`);
}

initAccount();
```

##### **JavaScript**

```javascript
const conseiljssoftsigner = require('conseiljs-softsigner');

const faucetAccount = {
    "mnemonic": [ "letter", "pair", "shuffle", "exotic", "sword", "west", "build", "monster", "future", "senior", "salt", "satisfy", "knock", "alert", "gorilla"],
    "secret": "0a09075426ab2658814c1faf101f53e5209a62f5",
    "amount": "5652123072",
    "pkh": "tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy",
    "password": "VvLbJMu1fF",
    "email": "yoyhmapi.ugewcsiv@tezos.example.org"
}

async function initAccount() {
    const keystore = await conseiljssoftsigner.KeyStoreUtils.restoreIdentityFromFundraiser(faucetAccount.mnemonic.join(' '), faucetAccount.email, faucetAccount.password, faucetAccount.pkh);
    console.log(`public key: ${keystore.publicKey}`);
    console.log(`secret key: ${keystore.secretKey}`);
}

initAccount();
```
<!-- tabs:end -->

This produces a public key of `edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj` and secret key of `edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH`. **Secret keys must be kept secure!**

#### Create an empty Tezos account

It is also possible to create unattached accounts on the chain. This would be the process for making accounts on mainnet that are not fundraiser accounts. Note that `restoreIdentityFromMnemonic` takes an optional password. This is not the same password that may have been used to encrypt the `KeyStoreUtils` file. Presenting the intermediate mnemonic to the user may aid in key recovery.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { KeyStoreUtils } from 'conseiljs-softsigner';

async function createAccount() {
    const mnemonic = KeyStoreUtils.generateMnemonic();
    console.log(`mnemonic: ${mnemonic}`);
    const keystore = await KeyStoreUtils.restoreIdentityFromMnemonic(mnemonic, '');
    console.log(`account id: ${keystore.publicKeyHash}`);
    console.log(`public key: ${keystore.publicKey}`);
    console.log(`secret key: ${keystore.secretKey}`);
}

createAccount();
```

##### **JavaScript**

```javascript
const conseiljssoftsigner = require('conseiljs-softsigner');

async function createAccount() {
    const mnemonic = conseiljssoftsigner.KeyStoreUtils.generateMnemonic();
    console.log(`mnemonic: ${mnemonic}`);
    const keystore = await conseiljssoftsigner.KeyStoreUtils.unlockIdentityWithMnemonic(mnemonic, '');
    console.log(`account id: ${keystore.publicKeyHash}`);
    console.log(`public key: ${keystore.publicKey}`);
    console.log(`secret key: ${keystore.secretKey}`);
}

createAccount();
```
<!-- tabs:end -->

You can also use `KeyStoreUtils.generateIdentity()`

#### Initialize the account

A faucet or Fundraiser account must be activated on the chain before it can be used. With the combination of the faucet output and the keys generated in the step above we can send an account activation operation. It's not possible or necessary to activate an unattached account, this operation will simply fail for those.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosNodeWriter, KeyStoreType } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

const tezosNode = ''; // get access as https://nautilus.cloud

async function activateAccount() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: KeyStoreType.Fundraiser
    };

    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const result = await TezosNodeWriter.sendIdentityActivationOperation(tezosNode, signer, keystore, '0a09075426ab2658814c1faf101f53e5209a62f5');
    console.log(`Injected operation group id ${result.operationGroupID}`)
}

activateAccount();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const conseiljssoftsigner = require('conseiljs-softsigner');
const tezosNode = ''; // get access as https://nautilus.cloud

async function activateAccount() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: conseiljs.KeyStoreType.Fundraiser
    };

    const signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const result = await conseiljs.TezosNodeWriter.sendIdentityActivationOperation(tezosNode, keystore, '0a09075426ab2658814c1faf101f53e5209a62f5');
    console.log(`Injected operation group id ${result.operationGroupID}`)
}

activateAccount();

```

##### **Web**

```html
<html>
<head>
    <script src="https://cdn.jsdelivr.net/gh/cryptonomic/conseiljs/dist-web/conseiljs.min.js"
        crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/gh/cryptonomic/conseiljs-softsigner/dist-web/conseiljs-softsigner.min.js"
        crossorigin="anonymous"></script>
    <script>
        const tezosNode = ''; // get access as https://nautilus.cloud

        async function activateAccount() {
            const keystore = {
                publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
                secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
                publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
                seed: '',
                storeType: conseiljs.KeyStoreType.Fundraiser
            };

            const signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
            const result = await conseiljs.TezosNodeWriter.sendIdentityActivationOperation(tezosNode, keystore, '0a09075426ab2658814c1faf101f53e5209a62f5');
            console.log(`Injected operation group id ${result.operationGroupID}`)
        }

        activateAccount();
    </script>
</head>
<body>
<form>
    <button onClick="activateAccount(); return false;">Activate Account</button>
</form>
</body>
</html>
```
<!-- tabs:end -->

The next step on Tezos is an account revelation,it is required for all accounts. This operation records the public key of the account on the chain. Account revelation is a paid operation, it's not possible to reveal a newly created 0-balance account.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosNodeWriter, KeyStoreType } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

const tezosNode = '';

async function revealAccount() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: KeyStoreType.Fundraiser
    };

    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const result = await TezosNodeWriter.sendKeyRevealOperation(tezosNode, signer, keystore);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

revealAccount();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const conseiljssoftsigner = require('conseiljs-softsigner');
const tezosNode = '';

async function revealAccount() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: conseiljs.KeyStoreType.Fundraiser
    };

    const signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const result = await conseiljs.TezosNodeWriter.sendKeyRevealOperation(tezosNode, signer, keystore);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

revealAccount();
```
<!-- tabs:end -->

#### Transfer value

The most basic operation on the chain is the transfer of value between two accounts. In this example we have the account we activated above: `tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy` and some random testnet address to test with: `tz1RVcUP9nUurgEJMDou8eW3bVDs6qmP5Lnc`. Note all amounts are in µtz, as in micro-tez, hence 0.5tz is represented as `500000`. The fee of `1500` was chosen arbitrarily, but some operations have minimum fee requirements.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosNodeWriter, KeyStoreType } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

const tezosNode = '';

async function sendTransaction() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: KeyStoreType.Fundraiser
    };

    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const result = await TezosNodeWriter.sendTransactionOperation(tezosNode, signer, keystore, 'tz1RVcUP9nUurgEJMDou8eW3bVDs6qmP5Lnc', 500_000, 1500);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

sendTransaction();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const conseiljssoftsigner = require('conseiljs-softsigner');
const tezosNode = '';

async function sendTransaction() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: conseiljs.KeyStoreType.Fundraiser
    };

    const signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const result = await conseiljs.TezosNodeWriter.sendTransactionOperation(tezosNode, signer, keystore, 'tz1RVcUP9nUurgEJMDou8eW3bVDs6qmP5Lnc', 500000, 1500);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

sendTransaction();
```
<!-- tabs:end -->

#### Delegate

One of the most exciting features of Tezos is delegation. This is a means for non-"baker" (non-validator) accounts to participate in the on-chain governance process and receive staking rewards. It is possible to delegate both implicit and originated accounts. For implicit addresses, those starting with tz1, tz2 and tz3, simply call `sendDelegationOperation`. Originated accounts, that is smart contracts, must explicitly support delegate assignment, but can also be deployed with a delegate already set.

Note that calling `sendDelegationOperation` will change an existing delegation if one is set. To cancel delegation use `sendUndelegationOperation`. Setting the delegation address to your own labels your account as a validator and should be avoided unless intentional. Sending a delegation to the same address as already set will result in operation failure.

Another important point is that delegation is applied per account for the full balance of that account. To delegate to multiple bakers from a single address, use `BabylonDelegationHelper`.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosMessageUtils, TezosNodeWriter, KeyStoreType } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

const tezosNode = '';

async function delegateAccount() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: KeyStoreType.Fundraiser
    };

    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const result = await TezosNodeWriter.sendDelegationOperation(tezosNode, signer, keystore, 'tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf', 10000);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

delegateAccount();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const conseiljssoftsigner = require('conseiljs-softsigner');
const tezosNode = '';

async function delegateAccount() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: conseiljs.KeyStoreType.Fundraiser
    };

    const signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const result = await conseiljs.TezosNodeWriter.sendDelegationOperation(tezosNode, signer, keystore, 'tz1VxS7ff4YnZRs8b4mMP4WaMVpoQjuo1rjf', 10000);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

delegateAccount();
```
<!-- tabs:end -->

### Smart Contract Interactions

Tezos smart contracts are natively executed in a stack-based type-safe language called Michelson. ConseilJS is able to deploy a large portion of contracts written in that language. Rather than compose contracts directly in Michelson, we encourage you to look at more developer-friendly options like [SmartPy](http://smartpy.io/dev/). Smart Chain Arena has [learning materials](https://smartpy.io/dev/help.html) and an excellent [reference for SmartPy](https://smartpy.io/dev/reference.html). The editor also has a set of sample contracts that demonstrate various smart contract techniques. Finally, Cryptonomic has put together a [Smart Contract Development Syllabus](https://medium.com/the-cryptonomic-aperiodical/smart-contract-development-syllabus-f285a8463a4d) based on SmartPy.

#### Deploy a Contract

A note of warning, as of Tezos Protocol 4, deployed in the Spring of 2019, originated accounts with code (smart contracts) are no longer 'spendable'. What this means is, deploying a contract with an initial balance that does not have functionality internally that enables transfer of this balance, will permanently lock that amount of XTZ.

One of the more exciting features of ConseilJS is that it allow for trustless chain interactions, including contract deployment directly from Michelson. For the curious the language parsing and transformation code lives inside the following: [`Michelson.ne`](https://github.com/Cryptonomic/ConseilJS/blob/master/grammar/tezos/Michelson.ne), [`Micheline.ne`](https://github.com/Cryptonomic/ConseilJS/blob/master/grammar/tezos/Micheline.ne), [`TezosLanguageUtil`](https://github.com/Cryptonomic/ConseilJS/blob/master/src/chain/tezos/TezosLanguageUtil.ts)), [`TezosMessageCodec`](https://github.com/Cryptonomic/ConseilJS/blob/master/src/chain/tezos/TezosMessageCodec.ts), [`TezosMessageUtil`](https://github.com/Cryptonomic/ConseilJS/blob/master/src/chain/tezos/TezosMessageUtil.ts). To find out more about the Michelson language, visit [the guide](https://michelson.nomadic-labs.com) from Nomadic Labs and the [Tezos platform documentation](https://tezos.gitlab.io/whitedoc/michelson.html).

<!-- tabs:start -->
##### **Typescript**

```typescript
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { registerFetch, registerLogger, TezosMessageUtils, TezosNodeWriter, TezosParameterFormat, KeyStoreType } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

const logger = log.getLogger('conseiljs');
logger.setLevel('debug', false);
registerLogger(logger);
registerFetch(fetch);

const tezosNode = '';

async function deployContract() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: KeyStoreType.Fundraiser
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

    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const result = await TezosNodeWriter.sendContractOriginationOperation(tezosNode, signer, keystore, 0, undefined, 100_000, 1000, 100_000, contract, storage, TezosParameterFormat.Micheline);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';



async function deployContract() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        secretKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: conseiljs.KeyStoreType.Fundraiser
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

    const signer = await conseiljssoftsigner.SoftSigner.createSigner(conseiljs.TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const result = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(tezosNode, signer, keystore, 0, undefined, 100000, 1000, 100000, contract, storage, conseiljs.TezosParameterFormat.Micheline);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

deployContract();

```
<!-- tabs:end -->

Using `awaitOperationConfirmation(...)` ConseilJS can monitor the chain via the Conseil indexer, waiting for the specified operation to appear, and then return the result set from Conseil for that operation. This can be used to ensure that the requested transaction has occurred, it will also produce an updated account counter. The example below originates a contract and then waits for it to be recorded so the address of the new contract can be extracted. This functionality requires an API key from [Nautilus Cloud](https://nautilus.cloud) or your own instance of Conseil.

<!-- tabs:start -->
##### **Typescript**

```typescript
import fetch from 'node-fetch';
import * as log from 'loglevel';

import { registerFetch, registerLogger, TezosMessageUtils, TezosNodeWriter, TezosParameterFormat, KeyStoreType } from 'conseiljs';
import { SoftSigner } from 'conseiljs-softsigner';

const logger = log.getLogger('conseiljs');
logger.setLevel('debug', false);
registerLogger(logger);
registerFetch(fetch);

const tezosNode = '';
const network = 'carthagenet';
const conseilServer = { url: '', apiKey: '', network };

async function deployContract() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        privateKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
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

    const signer = await SoftSigner.createSigner(TezosMessageUtils.writeKeyWithHint(keyStore.secretKey, 'edsk'));
    const nodeResult = await TezosNodeWriter.sendContractOriginationOperation(tezosNode, signer, keystore, 0, undefined, 100_000, 1000, 100_000, contract, storage, TezosParameterFormat.Michelson);

    const groupid = nodeResult['operationGroupID'].replace(/\"/g, '').replace(/\n/, ''); // clean up RPC output
    console.log(`Injected operation group id ${groupid}`);
    const conseilResult = await TezosConseilClient.awaitOperationConfirmation(conseilServer, network, groupid, 5);
    console.log(`Originated contract at ${conseilResult[0].originated_contracts}`);
}

deployContract();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';
const network = 'carthagenet';
const conseilServer = { url: '', apiKey: '', network };

conseiljs.setLogLevel('debug');

async function deployContract() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        privateKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
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

    const nodeResult = await conseiljs.TezosNodeWriter.sendContractOriginationOperation(tezosNode, signer, keystore, 0, undefined, 100000, 1000, 100000, contract, storage, conseiljs.TezosParameterFormat.Michelson);

    const groupid = nodeResult['operationGroupID'].replace(/\"/g, '').replace(/\n/, ''); // clean up RPC output
    console.log(`Injected operation group id ${groupid}`);
    const conseilResult = await conseiljs.TezosConseilClient.awaitOperationConfirmation(conseilServer, network, groupid, 5);
    console.log(`Originated contract at ${conseilResult[0].originated_accounts}`);
}

deployContract();

```
<!-- tabs:end -->

#### Invoke a Contract

Similarly to contract deployment, contract invocation can happen either with Michelson or Micheline format. There is also a convenience function for safety, `sendContractPing` that allows calling a contract with a 0 amount and no parameters. This was the invocation pattern for the Tezos Foundation [Ledger Nano S giveaway](https://tezos.foundation/news/tezos-foundation-to-give-away-ledger-nano-s-hardware-wallets-to-celebrate-one-year-since-betanet-launch) [registry contract](https://arronax.io/tezos/mainnet/operations/query/eyJmaWVsZHMiOlsidGltZXN0YW1wIiwiYmxvY2tfbGV2ZWwiLCJzb3VyY2UiLCJkZXN0aW5hdGlvbiIsImFtb3VudCIsImtpbmQiLCJmZWUiLCJvcGVyYXRpb25fZ3JvdXBfaGFzaCJdLCJwcmVkaWNhdGVzIjpbeyJmaWVsZCI6ImtpbmQiLCJvcGVyYXRpb24iOiJlcSIsInNldCI6WyJ0cmFuc2FjdGlvbiJdLCJpbnZlcnNlIjpmYWxzZX0seyJmaWVsZCI6InRpbWVzdGFtcCIsIm9wZXJhdGlvbiI6ImFmdGVyIiwic2V0IjpbMTU1OTM2MTYwMDAwMF0sImludmVyc2UiOmZhbHNlfSx7ImZpZWxkIjoiZGVzdGluYXRpb24iLCJvcGVyYXRpb24iOiJlcSIsInNldCI6WyJLVDFCUnVkRlpFWExZQU5nbVpUa2ExeENETjVuV1RNV1k3U1oiXSwiaW52ZXJzZSI6ZmFsc2V9LHsiZmllbGQiOiJ0aW1lc3RhbXAiLCJvcGVyYXRpb24iOiJiZWZvcmUiLCJzZXQiOlsxNTYzMjQ5NjAwMDAwXSwiaW52ZXJzZSI6ZmFsc2V9LHsiZmllbGQiOiJzdGF0dXMiLCJvcGVyYXRpb24iOiJlcSIsInNldCI6WyJhcHBsaWVkIl0sImludmVyc2UiOmZhbHNlfV0sIm9yZGVyQnkiOlt7ImZpZWxkIjoidGltZXN0YW1wIiwiZGlyZWN0aW9uIjoiZGVzYyJ9XSwiYWdncmVnYXRpb24iOltdLCJsaW1pdCI6MTAwMH0).

<!-- tabs:start -->
##### **Typescript**

```typescript
import { StoreType, TezosNodeWriter, TezosParameterFormat, setLogLevel } from 'conseiljs';

setLogLevel('debug');

const tezosNode = '';

async function invokeContract() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        privateKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, signer, keystore, contractAddress, 10_000, 100_000, 1000, 100_000, '"Cryptonomicon"', TezosParameterFormat.Michelson);
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
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        privateKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000, '"Cryptonomicon"', conseiljs.TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

invokeContract();
```
<!-- tabs:end -->

<!-- tabs:start -->
##### **Typescript**

```typescript
import { StoreType, TezosNodeWriter, TezosParameterFormat, setLogLevel } from 'conseiljs';

setLogLevel('debug');

const tezosNode = '';

async function invokeContract() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        privateKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000, '', '{"string": "Cryptonomicon"}', TezosParameterFormat.Micheline);
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
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        privateKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
    const contractAddress = 'KT1KA7DqFjShLC4CPtChPX8QtRYECUb99xMY';

    const result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000, '', '{"string": "Cryptonomicon"}', conseiljs.TezosParameterFormat.Micheline);
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
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        privateKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
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
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        privateKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
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

#### Extract Entry Points

Michelson contract are single-entry, meaning unlike other smart contract languages it only has one function that can be called externally. The work-around for this limitation is to create a tree of `if` statements inside that method that perform different operations. This results in a somewhat unintuitive invocation pattern. To help with this, ConseilJS provide contract introspection functions that can not only extract the entry points given a contract, but also generate the invocation parameter object for them. This functionality resides in the `TezosContractIntrospector` namespace which has several methods for parsing the interface given a contract address, full contract code or just the `parameter` portion of the contract: `generateEntryPointsFromAddress`, `generateEntryPointsFromCode`, `generateEntryPointsFromParams` respectively. Examples below use a version the proposed Tezos token standard, [FA1.2](https://gitlab.com/tzip/tzip/blob/master/A/FA1.2.md) deployed on a testnet at [KT1XFXwWCDMLkgWjhfqKUpDtBYWf3ZdUdKC3](https://arronax.io?e=Tezos%20Alphanet/accounts&m=true&q=eyJmaWVsZHMiOlsiYWNjb3VudF9pZCIsIm1hbmFnZXIiLCJiYWxhbmNlIiwic2NyaXB0Iiwic3RvcmFnZSIsImJsb2NrX2xldmVsIl0sInByZWRpY2F0ZXMiOlt7ImZpZWxkIjoiYWNjb3VudF9pZCIsIm9wZXJhdGlvbiI6ImVxIiwic2V0IjpbIktUMVhGWHdXQ0RNTGtnV2poZnFLVXBEdEJZV2YzWmRVZEtDMyJdLCJpbnZlcnNlIjpmYWxzZX1dLCJvcmRlckJ5IjpbeyJmaWVsZCI6ImJsb2NrX2xldmVsIiwiZGlyZWN0aW9uIjoiZGVzYyJ9XSwiYWdncmVnYXRpb24iOltdLCJsaW1pdCI6MTAwMH0).

<!-- tabs:start -->
##### **Typescript**

```typescript
import { TezosContractIntrospector, setLogLevel } from 'conseiljs';

setLogLevel('debug');

const tezosNode = '';

async function interrogateContract() {
    const contractParameters = `parameter (or (or (or (pair %transfer (address :from) (pair (address :to) (nat :value))) (or (pair %transferViaProxy (address :sender) (pair (address :from) (pair (address :to) (nat :value)))) (pair %approve (address :spender) (nat :value)))) (or (pair %approveViaProxy (address :sender) (pair (address :spender) (nat :value))) (or (pair %getAllowance (pair (address :owner) (address :spender)) (contract nat)) (pair %getBalance (address :owner) (contract nat))))) (or (or (pair %getTotalSupply unit (contract nat)) (or (bool %setPause) (address %setAdministrator))) (or (or (pair %getAdministrator unit (contract address)) (pair %mint (address :to) (nat :value))) (or (pair %burn (address :from) (nat :value)) (address %setProxy)))));`;

    const entryPoints = await TezosContractIntrospector.generateEntryPointsFromParams(contractParameters);
    entryPoints.forEach(p => {
        console.log(`${p.name}(${p.parameters.map(pp => (pp.name || 'unnamed') + '/' + pp.type).join(', ')})`);
    });

    console.log(entryPoints[0].generateParameter('', '', 999));
}

interrogateContract();
```

##### **JavaScript**

```javascript
const conseiljs = require('conseiljs');
const tezosNode = '';

conseiljs.setLogLevel('debug');

async function interrogateContract() {
    const contractParameters = `parameter (or (or (or (pair %transfer (address :from) (pair (address :to) (nat :value))) (or (pair %transferViaProxy (address :sender) (pair (address :from) (pair (address :to) (nat :value)))) (pair %approve (address :spender) (nat :value)))) (or (pair %approveViaProxy (address :sender) (pair (address :spender) (nat :value))) (or (pair %getAllowance (pair (address :owner) (address :spender)) (contract nat)) (pair %getBalance (address :owner) (contract nat))))) (or (or (pair %getTotalSupply unit (contract nat)) (or (bool %setPause) (address %setAdministrator))) (or (or (pair %getAdministrator unit (contract address)) (pair %mint (address :to) (nat :value))) (or (pair %burn (address :from) (nat :value)) (address %setProxy)))));`;

    const entryPoints = await conseiljs.TezosContractIntrospector.generateEntryPointsFromParams(contractParameters);
    entryPoints.forEach(p => {
        console.log(`${p.name}(${p.parameters.map(pp => (pp.name || 'unnamed') + '/' + pp.type).join(', ')})`);
    });

    console.log(entryPoints[0].generateParameter('', '', 999));
}

interrogateContract();
```
<!-- tabs:end -->

The output of the entry point iteration and a sample invocation pattern are below.

```text
%transfer(:from/address, :to/address, :value/nat)
%transferViaProxy(:sender/address, :from/address, :to/address, :value/nat)
%approve(:spender/address, :value/nat)
%approveViaProxy(:sender/address, :spender/address, :value/nat)
%getAllowance(:owner/address, :spender/address, unnamed/contract (nat))
%getBalance(:owner/address, unnamed/contract (nat))
%getTotalSupply(unnamed/unit, unnamed/contract (nat))
%setPause(unnamed/bool)
%setAdministrator(unnamed/address)
%getAdministrator(unnamed/unit, unnamed/contract (address))
%mint(:to/address, :value/nat)
%burn(:from/address, :value/nat)
%setProxy(unnamed/address)

(Left (Left (Left (Pair source-address (Pair destination-address 999)))))
```

Invoking this contract is now obvious! Don't forget that the make this call correctly, you'll need to substitue 'source-address' and 'destination-address' values for proper addresses, futhermore there are restrictions in the contract on who can execute various methods. In this case it must be either the token manager or the 'source-address' account.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { StoreType, TezosNodeWriter, TezosParameterFormat, setLogLevel } from 'conseiljs';

setLogLevel('debug');

const tezosNode = '';

async function invokeContract() {
    const keystore = {
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        privateKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: StoreType.Fundraiser
    };
    const contractAddress = 'KT1XFXwWCDMLkgWjhfqKUpDtBYWf3ZdUdKC3';

    const result = await TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000, '(Left (Left (Left (Pair source-address (Pair destination-address 999)))))', , TezosParameterFormat.Michelson);
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
        publicKey: 'edpkvQtuhdZQmjdjVfaY9Kf4hHfrRJYugaJErkCGvV3ER1S7XWsrrj',
        privateKey: 'edskRgu8wHxjwayvnmpLDDijzD3VZDoAH7ZLqJWuG4zg7LbxmSWZWhtkSyM5Uby41rGfsBGk4iPKWHSDniFyCRv3j7YFCknyHH',
        publicKeyHash: 'tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy',
        seed: '',
        storeType: conseiljs.StoreType.Fundraiser
    };
    const contractAddress = 'KT1XFXwWCDMLkgWjhfqKUpDtBYWf3ZdUdKC3';

    const result = await conseiljs.TezosNodeWriter.sendContractInvocationOperation(tezosNode, keystore, contractAddress, 10000, 100000, '', 1000, 100000, '(Left (Left (Left (Pair source-address (Pair destination-address 999)))))', , conseiljs.TezosParameterFormat.Michelson);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

invokeContract();
```
<!-- tabs:end -->

### Tezos Chain Operations with Hardware Devices

ConseilJS supports operation signing with [Ledger Nano S](https://shop.ledger.com/products/ledger-nano-s) devices. The interactions are largely the same as with software-signed operations. This functionality is encapsulated in the `TezosLedgerWallet` namespace. Before a Ledger-bound account can be used, it must be unlocked as described below. After that, retrieve and cache the account address, finally to sign transactions with the Ledger, pass the `derivationPath` parameter to the various interaction functions. Remember that the private key never leaves the device, hence the `KeyStore` object returned by `unlockAddress` will not have that field populated.

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

    const result = await TezosNodeWriter.sendTransactionOperation(tezosNode, keyStore, 'tz1RVcUP9nUurgEJMDou8eW3bVDs6qmP5Lnc', 500000, 1500, derivationPath);
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

    const result = await conseiljs.TezosNodeWriter.sendTransactionOperation(tezosNode, keyStore, 'tz1RVcUP9nUurgEJMDou8eW3bVDs6qmP5Lnc', 500000, 1500, derivationPath);
    console.log(`Injected operation group id ${result.operationGroupID}`);
}

sendTransaction("44'/1729'/0'/0'/0'");
```
<!-- tabs:end -->

### Metadata Discovery Functions

[Conseil](https://github.com/Cryptonomic/Conseil) blockchain indexer service is metadata-driven. Reports can be constructed in a fully dynamic fashion by discovering what a particular Conseil node has available. Unless you are running your own [Nautilus](https://github.com/Cryptonomic/Nautilus) instance, you'll need access to an existing one. Cryptonomic provides an infrastructure service for Tezos – [Nautilus Cloud](https://nautilus.cloud).

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
  { "name": "carthagenet", "displayName": "carthagenet", "platform": "tezos", "network": "carthagenet" } ]
```

#### Entities

Query for available chain entities on `Tezos` `carthagenet`.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { ConseilMetadataClient } from 'conseiljs';
import * as util from 'util';

const conseilServerInfo = { url: '', apiKey: '', network: 'carthagenet' };

async function listEntities() {
    const platforms = await ConseilMetadataClient.getEntities(conseilServerInfo, 'tezos', 'carthagenet');
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
    const platforms = await conseiljs.ConseilMetadataClient.getEntities(conseilServerInfo, 'tezos', 'carthagenet');
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
    const platforms = await ConseilMetadataClient.getAttributes(conseilServerInfo, 'tezos', 'carthagenet', 'operations');
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
    const platforms = await conseiljs.ConseilMetadataClient.getAttributes(conseilServerInfo, 'tezos', 'carthagenet', 'operations');
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

The metadata services provides distinct values for some low-cardinality fields. In this case we're querying for `operation` `kind` on `Tezos` `carthagenet`.

<!-- tabs:start -->
##### **Typescript**

```typescript
import { ConseilMetadataClient } from 'conseiljs';
import * as util from 'util';

const conseilServerInfo = { url: '', apiKey: '' };

async function listAttributeValues() {
    const platforms = await ConseilMetadataClient.getAttributeValues(conseilServerInfo, 'tezos', 'carthagenet', 'operations', 'kind');
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
    const platforms = await conseiljs.ConseilMetadataClient.getAttributeValues(conseilServerInfo, 'tezos', 'carthagenet', 'operations', 'kind');
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

Notice that it is possible to sort on and filter by fields that are not returned in the result set. Sent and received transactions must be queried for separately. Same address is used as an example: `tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy`.

<!-- tabs:start -->

##### **Typescript**

```typescript
import { ConseilDataClient, ConseilQueryBuilder, ConseilSortDirection, ConseilOperator } from 'conseiljs';
import * as util from 'util';

const platform = 'tezos';
const network = 'carthagenet';
const entity = 'operations';

const conseilServer = { url: '', apiKey: '', network };

async function listAccountTransactions() {
    let sendQuery = ConseilQueryBuilder.blankQuery();
    sendQuery = ConseilQueryBuilder.addFields(sendQuery, 'block_level', 'timestamp', 'source', 'destination', 'amount', 'fee', 'counter');
    sendQuery = ConseilQueryBuilder.addPredicate(sendQuery, 'kind', ConseilOperator.EQ, ['transaction'], false);
    sendQuery = ConseilQueryBuilder.addPredicate(sendQuery, 'source', ConseilOperator.EQ, ['tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy'], false);
    sendQuery = ConseilQueryBuilder.addPredicate(sendQuery, 'status', ConseilOperator.EQ, ['applied'], false);
    sendQuery = ConseilQueryBuilder.addOrdering(sendQuery, 'block_level', ConseilSortDirection.DESC);
    sendQuery = ConseilQueryBuilder.setLimit(sendQuery, 100);

    let receiveQuery = ConseilQueryBuilder.blankQuery();
    receiveQuery = ConseilQueryBuilder.addFields(receiveQuery, 'block_level', 'timestamp', 'source', 'destination', 'amount', 'fee', 'counter');
    receiveQuery = ConseilQueryBuilder.addPredicate(receiveQuery, 'kind', ConseilOperator.EQ, ['transaction'], false);
    receiveQuery = ConseilQueryBuilder.addPredicate(receiveQuery, 'destination', ConseilOperator.EQ, ['tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy'], false);
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
const network = 'carthagenet';
const entity = 'operations';

const conseilServer = { url: '', apiKey: '', network };

async function listAccountTransactions() {
    let sendQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    sendQuery = conseiljs.ConseilQueryBuilder.addFields(sendQuery, 'block_level', 'timestamp', 'source', 'destination', 'amount', 'fee', 'counter');
    sendQuery = conseiljs.ConseilQueryBuilder.addPredicate(sendQuery, 'kind', conseiljs.ConseilOperator.EQ, ['transaction'], false);
    sendQuery = conseiljs.ConseilQueryBuilder.addPredicate(sendQuery, 'source', conseiljs.ConseilOperator.EQ, ['tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy'], false);
    sendQuery = conseiljs.ConseilQueryBuilder.addPredicate(sendQuery, 'status', conseiljs.ConseilOperator.EQ, ['applied'], false);
    sendQuery = conseiljs.ConseilQueryBuilder.addOrdering(sendQuery, 'block_level', conseiljs.ConseilSortDirection.DESC);
    sendQuery = conseiljs.ConseilQueryBuilder.setLimit(sendQuery, 100);

    let receiveQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    receiveQuery = conseiljs.ConseilQueryBuilder.addFields(receiveQuery, 'block_level', 'timestamp', 'source', 'destination', 'amount', 'fee', 'counter');
    receiveQuery = conseiljs.ConseilQueryBuilder.addPredicate(receiveQuery, 'kind', conseiljs.ConseilOperator.EQ, ['transaction'], false);
    receiveQuery = conseiljs.ConseilQueryBuilder.addPredicate(receiveQuery, 'destination', conseiljs.ConseilOperator.EQ, ['tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy'], false);
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
[ { "source": "tz1QSHaKpTFhgHLbqinyYRjxD5sLcbfbzhxy",
    "timestamp": 1554614628000,
    "block_level": 286240,
    "amount": 500000,
    "counter": 36041,
    "destination": "tz1RVcUP9nUurgEJMDou8eW3bVDs6qmP5Lnc",
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
const network = 'carthagenet';
const entity = 'operations';

const conseilServer = { url: '', apiKey: '', network };

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
const network = 'carthagenet';
const entity = 'operations';

const conseilServer = { url: '', apiKey: '', network };

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
const network = 'carthagenet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '', network };

async function accountInfo(address: string) {
    let accountQuery = ConseilQueryBuilder.blankQuery();
    accountQuery = ConseilQueryBuilder.addFields(accountQuery, 'account_id', 'delegate_value', 'balance', 'block_level');
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
const network = 'carthagenet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '', network };

async function accountInfo(address: string) {
    let accountQuery = conseiljs.ConseilQueryBuilder.blankQuery();
    accountQuery = conseiljs.ConseilQueryBuilder.addFields(accountQuery, 'account_id', 'delegate_value', 'balance', 'block_level');
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
const network = 'carthagenet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '', network };

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
const network = 'carthagenet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '', network };

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
const network = 'carthagenet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '', network };

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
const network = 'carthagenet';
const entity = 'accounts';

const conseilServer = { url: '', apiKey: '', network };

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

This collection of methods for creating entity queries.

##### addAggregationFunction(query, field, aggregationFunction)

It is possible to apply an aggregation function to a field in the query. This field must be present in the `fields` collection. The aggregation function is one of `avg`, `count`, `max`, `min`, `sum` as defined in the `ConseilFunction` enum. `count` can be applied to any field type; `max`, `min` can be applied to a datetime or numeric fields, while `avg` and `sum` are only valid on numeric fields.

##### addFields(query, ...fields)

By default, all fields are returned, but using the information from the ConseilMetadataClient for the appropriate platform/network/entity combination.

##### addOrdering(query, field, direction)

One or more ordering instructions can be added to a query and they may be applied on fields that are not part of the result set.

The default direction is `ASC`. Direction values are in the `ConseilSortDirection` enum.

##### addPredicate(query, field, operation, values, invert, group)

Several predicate operations are supported. For string values: `EQ`, `IN`, `LIKE`, `STARTSWITH`, `ENDSWITH`, `ISNULL`. For numbers and dates: `EQ`, `IN`, `BETWEEN`, `LT` or `BEFORE`, `GT` or `AFTER`, `ISNULL`. The operation values are located in the `ConseilOperator` enum. The difference between `LIKE` and `STARTSWITH` and `ENDSWITH`, is that the former will do a match at any point in the text.

There are limitations on the contents of the values array depending on the supplied operation. `EQ` requires a single value, `IN` an contain multiple, `BETWEEN` only accepts two.

The `invert` parameter is to allow for queries like `not in`, or `is not null`, `!=`. Default is `false`.

Lastly, the optional `group` parameter allows to associated predicates into groups so they can be applied with and OR condition instead of AND.

##### blankQuery()

This method creates a minimum viable query that can be sent a Conseil data service like `TezosConseilClient`.

##### setLimit(query, limit)

The default record set is 100 rows. This can be changed using this method, however the server may override the request.

##### setOutputType(query, outputType)

By default, the service will return json data. For large datasets this is suboptimal. This function sets the output parameter of the ConseilQuery to one of 'json' or 'csv' as defined in `ConseilOutput` enum.

#### ConseilMetadataClient

For details, see [API Examples](#metadata-discovery-functions) below.

#### ConseilDataClient

#### executeEntityQuery(serverInfo, platform, network, entity, query)

The single method of this namespace submits queries from the `ConseilQueryBuilder` to the Conseil service endpoint.

#### TezosConseilClient

Functions for querying the Conseil back-end REST API v2 for Tezos. This functionality is offered by wrapping ConseilDataClient for Tezos-specific entities.

All of these methods require Conseil connection object which is a URL and API key. The `serverInfo` parameter below is of type `ConseilServerInfo`. Some of the methods also take a `query` parameter of type `ConseilQuery`, these are best constructed with `ConseilQueryBuilder` described [earlier](#ConseilQueryBuilder).

##### awaitOperationConfirmation(serverInfo, network, hash, duration, blocktime)

This function will monitor the chain for an operation with the given `hash` for up a `duration` blocks on some `network`. If the operation is found, it will be returned, otherwise an `Error` is thrown.

##### awaitOperationForkConfirmation(serverInfo, network, hash, duration, depth)

##### getAccount(serverInfo, network, accountID)

Returns a specific account on the given `network` with the provided `accountID`. In Tezos account id, account address, public key hash (phk) all refer to the same thing. All account entity fields are returned. To get just a subset of fields, use `getAccounts(serverInfo, network, query)`.

##### getAccounts(serverInfo, network, query)

Returns account information subject to the provided `query` on a given `network`.

##### getBakers(serverInfo, network, query)

Returns baker information subject to the provided `query` on a given `network`.

##### getBallots(serverInfo, network, query)

Returns ballot information subject to the provided `query` on a given `network`.

##### getBlock(serverInfo, network, hash)

Returns a specific block with the given `hash` and `network`. All block entity fields are returned. To get just a subset of fields, use `getBlocks(serverInfo, network, query)`.

##### getBlockByLevel(serverInfo, network level)

Returns a specific block at the provided `level` from the `network`. All block entity fields are returned.

##### getBlockHead(serverInfo, network)

Returns the most recent block on the chain for a given `network`. Internally this is implemented with a `ConseilQuery` ordered by block level with limit 1. All block entity fields are returned. To get just a subset of fields, use `getBlocks(serverInfo, network, query)`.

##### getBlocks(serverInfo, network, query)

Returns block information subject to the provided `query` on a given `network`.

##### getEntityQueryForId(id)

A conveniences function that enabled dynamic id-based search. For a specified `id`, it returns the entity type and a query necessary to get it from the service. Numeric ids are assumed to be block level.

##### getFeeStatistics(serverInfo, network, operationType)

Conseil indexer calculates running average fees by operation type. This is a convenience method to get that information. [Tezori](https://github.com/Cryptonomic/Tezori/blob/master/app/utils/general.js#L168) for example uses this information to suggest an appropriate fee to the user via a drop-down.

##### getOperationGroup(serverInfo, network, operationGroupID)

Returns a specific operation group on the given `network` with the provided `operationGroupID`. In Tezos individual operations are not keyed. All operation group entity fields are returned. To get just a subset of fields, use `getOperationGroups(serverInfo, network, query)`.

##### getOperationGroups(serverInfo, network, query)

Returns operation group information subject to the provided `query` on a given `network`.

##### getOperations(serverInfo, network, query)

Returns operation information subject to the provided `query` on a given `network`.

##### getProposals(serverInfo, network, query)

Returns proposal information subject to the provided `query` on a given `network`.

##### getTezosEntityData(serverInfo, network, entity, query)

Returns a record set for a specific entity of the Tezos platform. Entity list and metadata can be retrieved using `ConseilMetadataClient`.

#### TezosLedgerWallet

Identity management and signing functions to enable Tezos node interactions with the Ledger Nano S hardware wallet.

##### initLedgerTransport

Before the Ledger device can be used, the connection must be initialized with this call.

##### unlockAddress(deviceType, derivationPath)

Returns a partial `KeyStore` container public key and public key hash (address) for a given `derivationPath`. The private key does not leave the device. `deviceType` must be `HardwareDeviceType.LedgerNanoS`.

##### getTezosPublicKey(derivationPath: string): Promise&lt;string&gt;

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

## NPM Target Overview

### `npm run test`

### `npm run coverage`

### `npm run format`

### `npm run package`

## Contribute

There are many ways to contribute to this project. You can develop applications or dApps with it. You can submit bug reports or feature requests. You can ask questions about it on [r/Tezos](http://reddit.com/r/tezos/) or the [Tezos StackExchange](https://tezos.stackexchange.com). We certainly welcome pull requests as well.

## Other references

[Wiki](https://github.com/Cryptonomic/ConseilJS/wiki/Tutorial:-Querying-for-Tezos-alphanet-data-using-the-ConseilJS-v2-API)

[Riot Dev Channel](https://matrix.to/#/!rUwpbdwWhWgKINPyOD:cryptonomic.tech?via=cryptonomic.tech&via=matrix.org&via=ostez.com)

[Cryptonomic Reddit](https://www.reddit.com/r/cryptonomic)

[The Cryptonomic Aperiodical](https://medium.com/the-cryptonomic-aperiodical)

[@CryptonomicTech](https://twitter.com/CryptonomicTech)
