[conseiljs](../README.md) > [TezosNodeReader](../modules/tezosnodereader.md)

# Module: TezosNodeReader

Utility functions for interacting with a Tezos node.

## Index

### Functions

* [getAccountForBlock](tezosnodereader.md#getaccountforblock)
* [getAccountManagerForBlock](tezosnodereader.md#getaccountmanagerforblock)
* [getBlock](tezosnodereader.md#getblock)
* [getBlockHead](tezosnodereader.md#getblockhead)

---

## Functions

<a id="getaccountforblock"></a>

###  getAccountForBlock

▸ **getAccountForBlock**(server: *`string`*, blockHash: *`string`*, accountID: *`string`*): `Promise`<[Account](../interfaces/account.md)>

*Defined in [chain/tezos/TezosNodeReader.ts:64](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosNodeReader.ts#L64)*

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

*Defined in [chain/tezos/TezosNodeReader.ts:77](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosNodeReader.ts#L77)*

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

*Defined in [chain/tezos/TezosNodeReader.ts:42](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosNodeReader.ts#L42)*

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

*Defined in [chain/tezos/TezosNodeReader.ts:52](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosNodeReader.ts#L52)*

Gets the top block.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Which Tezos node to go against |

**Returns:** `Promise`<[BlockMetadata](../interfaces/blockmetadata.md)>
Block head

___

