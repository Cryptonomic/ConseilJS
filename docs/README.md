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
$ npm i conseiljs
```

If you are using webpack in your project, add below lines to your `webpack.config.js` file:

```javascript
node: { fs: 'empty' }
```

We have a complete [React application example](https://github.com/Cryptonomic/ConseilJS-Tutorials) for you to check out.

## Use with Web
```html
<script src="https://cdn.jsdelivr.net/gh/cryptonomic/conseiljs/dist-web/conseiljs.min.js"
        integrity="sha384-fNmrK/ez+TaHWU7Q4NJqoApMg/PEUAoB+zaQu8zMoFfI24HT4yG1nT4U1cdApmOm"
        crossorigin="anonymous"></script>
```

A fully functional sample [webpage example](https://github.com/Cryptonomic/ConseilJS-HTML-Example) is available too.

## API Overview and Examples

### API Key

Some ConseilJS functions require an API key for a Conseil service instance. While direct chain interactions happen via a Tezos node, Conseil read operations like those in `TezosConseilClient` namespace do require an API key however.

Obtaining a development key is easy. Hit us on the [Riot Dev Channel](https://matrix.to/#/!rUwpbdwWhWgKINPyOD:cryptonomic.tech?via=cryptonomic.tech&via=matrix.org&via=ostez.com) and we'll hook you up.

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

##### setLimitsetLimit(query, limit)

The default record set is 100 rows. This can be changed using this method, however the server may override the request.

#### ConseilMetadataClient

For details, see [API Examples](#metadata-discovery-functions) below.

#### ConseilDataClient

#### TezosConseilClient

Functions for querying the Conseil back-end REST API v2 for Tezos. This functionality is offered by wrapping ConseilDataClient for Tezos-specific entities.

#### TezosHardwareWallet

Functions for interaction with the Tezos node via a Hardware wallet. (Only Ledger Nano S for now)

#### TezosMessageCodec

A collection of functions to encode and decode various Tezos P2P message components

#### TezosNodeReader

Utility functions for interacting with the Tezos node.

#### TezosNodeWriter

Functions for sending operations on the Tezos network.

#### TezosFileWallet

Functions for Tezos wallet functionality.

#### TezosTypes

Types used to process data returned from Conseil server.

### Tezos Chain Operations

To execute operations on the Tezos chain a link to a Tezos node is required. One can be found on the [tzscan public node page](https://tzscan.io/nodes). Be sure to initialize the `tezosNode` variable accordingly. Interface to this functionality is in the `TezosNodeWriter` namespace.

#### Create a chain identity

Visit [Alphanet Faucet](https://faucet.tzalpha.net) to get a test account on the Tezos Alphanet. With this information we can create the public and private keys necessary to participate in the network. In the below examples, `alphanetFaucetAccount` is assigned the contents of the file the faucet produces.

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

This produces a public key of `edpkuuGJ4ssH3N5k7ovwkBe16p8rVX1XLENiZ4FAayrcwUf9sCKXnG` and secret key of `edskRpVqFG2FHo11aB9pzbnHBiPBWhNWdwtNyQSfEEhDf5jhFbAtNS41vg9as7LSYZv6rEbtJTwyyEg9cNDdcAkSr9Z7hfvquB`. **Secret keys must be kept secure!**

#### Initialize a chain identity

An account must be activated on the chain before it can be used. With the combination of the faucet output and the keys generated in the step above we can send an account activation operation.

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

Operation result can be viewed on a [block explorer](https://alphanet.tzscan.io/ont2jgMsL51w3BAMJhqgsg6AoySLXsAXKzBrF1Xdyqw9f6dq8hE) for more details.

The next step on Tezos is an account revelation.

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

Once again we can confirm the results: [`ooFjXs4oCWfpm5XbbMPa9spohRk3933qmDDBBLkbDPcdPpxL9eM`](https://alphanet.tzscan.io/ooFjXs4oCWfpm5XbbMPa9spohRk3933qmDDBBLkbDPcdPpxL9eM).

#### Transfer value

The most basic operation on the chain is the transfer of value between two accounts. In this example we have the account we activated above: `tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z` and some random Alphanet address to test with: `tz1aCy8b6Ls4Gz7m5SbANjtMPiH6dZr9nnS2`. Note all amounts are in µtz, as in micro-tez, hence 0.5tz is repsented as `500000`.

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
    console.log(`Injected operation group id ${result.operationGroupID}`)
}

sendTransaction();
```

The results: [`onj7NTxcaW5Gopx7cy6Wwxxfe6ttFFyZmgqkHEhCxTsZ7Qx7a5h`](https://alphanet.tzscan.io/onj7NTxcaW5Gopx7cy6Wwxxfe6ttFFyZmgqkHEhCxTsZ7Qx7a5h).


#### Delegate

One of the most exciting features of Tezos is delegation. To delegate tz, an account must be originated. We picked a random Alphanet baker to delegate to: `tz3gN8NTLNLJg5KRsUU47NHNVHbdhcFXjjaB`.

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
    console.log(`Injected operation group id ${result.operationGroupID}`)
}

originateAccount();
```
The results: [`ooqNtzH1Pxt3n7Bas9JsRW1f8QLEU4yABQbqHiXL5aws4H2rwVA`](https://alphanet.tzscan.io/ooqNtzH1Pxt3n7Bas9JsRW1f8QLEU4yABQbqHiXL5aws4H2rwVA).

### Metadata Discovery Functions

[Conseil](https://github.com/Cryptonomic/Conseil) blockchain indexer service is metadata-driven. Reports can be constructed in a fully dynamic fashion by discovering what a particular Conseil node has available. Unless you are running your own [Nautilus](https://github.com/Cryptonomic/Nautilus) instance, you'll need access to an existing one. Cryptonomic provides a small server for developers to try. Reach out on the [Riot Dev Channel](https://matrix.to/#/!rUwpbdwWhWgKINPyOD:cryptonomic.tech?via=cryptonomic.tech&via=matrix.org&via=ostez.com) for details.

All metadata functions are in the `ConseilMetadataClient` namespace. Internally all of these are REST GET requests. An `apiKey` header is required. The ConseilJS api takes care of these details. Each successive request relies on the results of the previous one. Using the information provide by this service it's possible to construct data queries discussed in the next section.

#### Platforms

Query for available platforms.

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

A result set may look like this:

```json
[ { "name": "tezos", "displayName": "Tezos" } ]
```

#### Networks

Query for networks under the `Tezos` platform.

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

The service might return:

```json
[ { "name": "zeronet", "displayName": "Zeronet", "platform": "tezos", "network": "zeronet" },
  { "name": "alphanet", "displayName": "Alphanet", "platform": "tezos", "network": "alphanet" } ]
```

#### Entities

Query for available chain entities on `Tezos` `alphanet`.
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

Result here is:

```json
[ "seed_nonce_revelation", "delegation", "transaction", "activate_account", "origination", "reveal", "double_baking_evidence", "endorsement" ]
```

This information can be used to create a drop-down list in some UI, or allow for type-ahead-autocomplete, etc.

### Reporting &amp; Analytics Functions

For the Tezos chain these methods are in the `TezosConseilClient` namespace, in addition to `apiKey`, `Content-Type=application/json` header must be present. All data requests are REST POST.

#### List transactions for an address

Notice that it is possible to sort on and filter by fields that are not returned in the result set. Sent and received transactions must be queried for separately. Same address is used as an example: `tz1WpPzK6NwWVTJcXqFvYmoA6msQeVy1YP6z`.

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

#### List transactions for an account within a date range

#### List all originated accounts

#### List all managed accounts

#### List all smart contracts

#### List top-10 bakers by balance

#### List top-10 bakers by delegator count

#### Export a large dataset to csv

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
