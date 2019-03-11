[conseiljs](../README.md) > [TezosNodeReader](../modules/tezosnodereader.md)

# Module: TezosNodeReader

Utility functions for interacting with a Tezos node.

## Index

### Functions

* [getAccountForBlock](tezosnodereader.md#getaccountforblock)
* [getAccountManagerForBlock](tezosnodereader.md#getaccountmanagerforblock)
* [getBlock](tezosnodereader.md#getblock)
* [getBlockHead](tezosnodereader.md#getblockhead)
* [isImplicitAndEmpty](tezosnodereader.md#isimplicitandempty)
* [isManagerKeyRevealedForAccount](tezosnodereader.md#ismanagerkeyrevealedforaccount)

---

## Functions

<a id="getaccountforblock"></a>

###  getAccountForBlock

▸ **getAccountForBlock**(server: *`string`*, blockHash: *`string`*, accountID: *`string`*): `Promise`<[Account](../interfaces/account.md)>

*Defined in [chain/tezos/TezosNodeReader.ts:65](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeReader.ts#L65)*

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

*Defined in [chain/tezos/TezosNodeReader.ts:78](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeReader.ts#L78)*

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

*Defined in [chain/tezos/TezosNodeReader.ts:43](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeReader.ts#L43)*

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

*Defined in [chain/tezos/TezosNodeReader.ts:53](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeReader.ts#L53)*

Gets the top block.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Which Tezos node to go against |

**Returns:** `Promise`<[BlockMetadata](../interfaces/blockmetadata.md)>
Block head

___
<a id="isimplicitandempty"></a>

###  isImplicitAndEmpty

▸ **isImplicitAndEmpty**(server: *`string`*, accountHash: *`string`*): `Promise`<`boolean`>

*Defined in [chain/tezos/TezosNodeReader.ts:90](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeReader.ts#L90)*

Indicates whether an account is implicit and empty. If true, transaction will burn 0.257tz.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| accountHash | `string` |  Account address |

**Returns:** `Promise`<`boolean`>
Result

___
<a id="ismanagerkeyrevealedforaccount"></a>

###  isManagerKeyRevealedForAccount

▸ **isManagerKeyRevealedForAccount**(server: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*): `Promise`<`boolean`>

*Defined in [chain/tezos/TezosNodeReader.ts:107](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeReader.ts#L107)*

Indicates whether a reveal operation has already been done for a given account.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |

**Returns:** `Promise`<`boolean`>
Result

___

