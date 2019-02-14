[conseiljs](../README.md) > [TezosNodeReader](../modules/tezosnodereader.md)

# Module: TezosNodeReader

Utility functions for interacting with a Tezos node.

## Index

### Functions

* [applyOperation](tezosnodereader.md#applyoperation)
* [forgeOperation](tezosnodereader.md#forgeoperation)
* [getAccountForBlock](tezosnodereader.md#getaccountforblock)
* [getAccountManagerForBlock](tezosnodereader.md#getaccountmanagerforblock)
* [getBlock](tezosnodereader.md#getblock)
* [getBlockHead](tezosnodereader.md#getblockhead)
* [injectOperation](tezosnodereader.md#injectoperation)

---

## Functions

<a id="applyoperation"></a>

###  applyOperation

▸ **applyOperation**(server: *`string`*, payload: *`object`*): `Promise`<[AlphaOperationsWithMetadata](../interfaces/alphaoperationswithmetadata.md)[]>

*Defined in [chain/tezos/TezosNodeReader.ts:119](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/chain/tezos/TezosNodeReader.ts#L119)*

Applies an operation using the Tezos RPC client.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Which Tezos node to go against |
| payload | `object` |  Payload set according to protocol spec |

**Returns:** `Promise`<[AlphaOperationsWithMetadata](../interfaces/alphaoperationswithmetadata.md)[]>
Applied operation

___
<a id="forgeoperation"></a>

###  forgeOperation

▸ **forgeOperation**(server: *`string`*, opGroup: *`object`*): `Promise`<`string`>

*Defined in [chain/tezos/TezosNodeReader.ts:104](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/chain/tezos/TezosNodeReader.ts#L104)*

Forge an operation group using the Tezos RPC client.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Which Tezos node to go against |
| opGroup | `object` |  Operation group payload |

**Returns:** `Promise`<`string`>
Forged operation

___
<a id="getaccountforblock"></a>

###  getAccountForBlock

▸ **getAccountForBlock**(server: *`string`*, blockHash: *`string`*, accountID: *`string`*): `Promise`<[Account](../interfaces/account.md)>

*Defined in [chain/tezos/TezosNodeReader.ts:79](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/chain/tezos/TezosNodeReader.ts#L79)*

Fetches a specific account for a given block.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Which Tezos node to go against |
| blockHash | `string` |  Hash of given block |
| accountID | `string` |  Account ID |

**Returns:** `Promise`<[Account](../interfaces/account.md)>
The account

___
<a id="getaccountmanagerforblock"></a>

###  getAccountManagerForBlock

▸ **getAccountManagerForBlock**(server: *`string`*, blockHash: *`string`*, accountID: *`string`*): `Promise`<[ManagerKey](../interfaces/managerkey.md)>

*Defined in [chain/tezos/TezosNodeReader.ts:92](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/chain/tezos/TezosNodeReader.ts#L92)*

Fetches the manager of a specific account for a given block.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Which Tezos node to go against |
| blockHash | `string` |  Hash of given block |
| accountID | `string` |  Account ID |

**Returns:** `Promise`<[ManagerKey](../interfaces/managerkey.md)>
The account

___
<a id="getblock"></a>

###  getBlock

▸ **getBlock**(server: *`string`*, hash: *`string`*): `Promise`<[BlockMetadata](../interfaces/blockmetadata.md)>

*Defined in [chain/tezos/TezosNodeReader.ts:57](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/chain/tezos/TezosNodeReader.ts#L57)*

Gets a block for a given hash.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Which Tezos node to go against |
| hash | `string` |  Hash of the given block |

**Returns:** `Promise`<[BlockMetadata](../interfaces/blockmetadata.md)>
Block

___
<a id="getblockhead"></a>

###  getBlockHead

▸ **getBlockHead**(server: *`string`*): `Promise`<[BlockMetadata](../interfaces/blockmetadata.md)>

*Defined in [chain/tezos/TezosNodeReader.ts:67](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/chain/tezos/TezosNodeReader.ts#L67)*

Gets the top block.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Which Tezos node to go against |

**Returns:** `Promise`<[BlockMetadata](../interfaces/blockmetadata.md)>
Block head

___
<a id="injectoperation"></a>

###  injectOperation

▸ **injectOperation**(server: *`string`*, payload: *`string`*): `Promise`<`string`>

*Defined in [chain/tezos/TezosNodeReader.ts:134](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/chain/tezos/TezosNodeReader.ts#L134)*

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Which Tezos node to go against |
| payload | `string` |  Payload set according to protocol spec |

**Returns:** `Promise`<`string`>
Injected operation

___

