[conseiljs](../README.md) > [TezosMessageUtils](../modules/tezosmessageutils.md)

# Module: TezosMessageUtils

A collection of functions to encode and decode various Tezos P2P message components like amounts, addresses, hashes, etc.

## Index

### Functions

* [computeKeyHash](tezosmessageutils.md#computekeyhash)
* [computeOperationHash](tezosmessageutils.md#computeoperationhash)
* [findInt](tezosmessageutils.md#findint)
* [readAddress](tezosmessageutils.md#readaddress)
* [readAddressWithHint](tezosmessageutils.md#readaddresswithhint)
* [readBoolean](tezosmessageutils.md#readboolean)
* [readBranch](tezosmessageutils.md#readbranch)
* [readBufferWithHint](tezosmessageutils.md#readbufferwithhint)
* [readInt](tezosmessageutils.md#readint)
* [readKeyWithHint](tezosmessageutils.md#readkeywithhint)
* [readPublicKey](tezosmessageutils.md#readpublickey)
* [readSignatureWithHint](tezosmessageutils.md#readsignaturewithhint)
* [writeAddress](tezosmessageutils.md#writeaddress)
* [writeBoolean](tezosmessageutils.md#writeboolean)
* [writeBranch](tezosmessageutils.md#writebranch)
* [writeBufferWithHint](tezosmessageutils.md#writebufferwithhint)
* [writeInt](tezosmessageutils.md#writeint)
* [writeKeyWithHint](tezosmessageutils.md#writekeywithhint)
* [writePublicKey](tezosmessageutils.md#writepublickey)

---

## Functions

<a id="computekeyhash"></a>

###  computeKeyHash

▸ **computeKeyHash**(key: *`Buffer`*, prefix?: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:301](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L301)*

Consumes a Base58-check key and produces a 20 byte key hash, often referred to as address.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| key | `Buffer` | - |  Base58-check encoded key |
| `Default value` prefix | `string` | &quot;tz1&quot; |  A key hint, eg: 'tz1', 'tz2', etc. |

**Returns:** `string`
Base58-check encoded key hash.

___
<a id="computeoperationhash"></a>

###  computeOperationHash

▸ **computeOperationHash**(signedOpGroup: *[SignedOperationGroup](../interfaces/signedoperationgroup.md)*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:289](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L289)*

Computes a hash of an operation group then encodes it with Base58-check. This value becomes the operation group id.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| signedOpGroup | [SignedOperationGroup](../interfaces/signedoperationgroup.md) |  Signed operation group |

**Returns:** `string`
Base58Check hash of signed operation

___
<a id="findint"></a>

###  findInt

▸ **findInt**(hex: *`string`*, offset: *`number`*): `object`

*Defined in [chain/tezos/TezosMessageUtil.ts:67](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L67)*

Takes a hex string and reads a hex-encoded Zarith-formatted number starting at provided offset. Returns the number itself and the number of characters that were used to decode it.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  Encoded message. |
| offset | `number` |  Offset within the message to start decoding from. |

**Returns:** `object`

___
<a id="readaddress"></a>

###  readAddress

▸ **readAddress**(hex: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:91](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L91)*

Takes a bounded hex string that is known to contain a Tezos address and decodes it. Supports implicit tz1, tz2, tz3 accounts and originated kt1. An address is a public key hash of the account.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  Encoded message part. |

**Returns:** `string`

___
<a id="readaddresswithhint"></a>

###  readAddressWithHint

▸ **readAddressWithHint**(b: *`Buffer` \| `Uint8Array`*, hint: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:116](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L116)*

Reads an address value from binary and decodes it into a Base58-check address without a prefix.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| b | `Buffer` \| `Uint8Array` |  Bytes containing address. |
| hint | `string` |  One of: 'kt1', 'tz1', 'tz2', 'tz3'. |

**Returns:** `string`

___
<a id="readboolean"></a>

###  readBoolean

▸ **readBoolean**(hex: *`string`*): `boolean`

*Defined in [chain/tezos/TezosMessageUtil.ts:28](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L28)*

Takes a bounded hex string that is known to contain a boolean and decodes it as int.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  Encoded message part. |

**Returns:** `boolean`

___
<a id="readbranch"></a>

###  readBranch

▸ **readBranch**(hex: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:157](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L157)*

Reads the branch hash from the provided, bounded hex string.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  Encoded message part. |

**Returns:** `string`

___
<a id="readbufferwithhint"></a>

###  readBufferWithHint

▸ **readBufferWithHint**(b: *`Buffer` \| `Uint8Array`*, hint: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:262](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L262)*

Reads a binary buffer and decodes it into a Base58-check string subject to a hint. Calling this method with a blank hint makes it a wraper for base58check.encode().

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| b | `Buffer` \| `Uint8Array` |  Bytes to encode |
| hint | `string` |  One of: 'op' (operation encoding helper), '' (blank) |

**Returns:** `string`

___
<a id="readint"></a>

###  readInt

▸ **readInt**(hex: *`string`*): `number`

*Defined in [chain/tezos/TezosMessageUtil.ts:50](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L50)*

Takes a bounded hex string that is known to contain a number and decodes the int.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  Encoded message part. |

**Returns:** `number`

___
<a id="readkeywithhint"></a>

###  readKeyWithHint

▸ **readKeyWithHint**(b: *`Buffer` \| `Uint8Array`*, hint: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:214](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L214)*

Reads a key without a prefix from binary and decodes it into a Base58-check representation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| b | `Buffer` \| `Uint8Array` |  Bytes containing the key. |
| hint | `string` |  One of 'edsk' (private key), 'edpk' (public key). |

**Returns:** `string`

___
<a id="readpublickey"></a>

###  readPublicKey

▸ **readPublicKey**(hex: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:178](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L178)*

Reads the public key from the provided, bounded hex string into a Base58-check string.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  Encoded message part. |

**Returns:** `string`
Key.

___
<a id="readsignaturewithhint"></a>

###  readSignatureWithHint

▸ **readSignatureWithHint**(b: *`Buffer` \| `Uint8Array`*, hint: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:246](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L246)*

Reads a signature value without a prefix from binary and decodes it into a Base58-check representation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| b | `Buffer` \| `Uint8Array` |  Bytes containing signature. |
| hint | `string` |  Support 'edsig'. |

**Returns:** `string`

___
<a id="writeaddress"></a>

###  writeAddress

▸ **writeAddress**(address: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:138](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L138)*

Encodes a Tezos address to hex, stripping off the top 3 bytes which contain address type, either 'tz1', 'tz2', 'tz3' or 'kt1'. Message format contains hints on address type.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| address | `string` |  Base58-check address to encode. |

**Returns:** `string`
Hex representation of a Tezos address.

___
<a id="writeboolean"></a>

###  writeBoolean

▸ **writeBoolean**(value: *`boolean`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:20](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L20)*

Encodes a boolean as 0 or 255 by calling writeInt.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| value | `boolean` |   |

**Returns:** `string`

___
<a id="writebranch"></a>

###  writeBranch

▸ **writeBranch**(branch: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:168](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L168)*

Encodes the branch hash to hex.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| branch | `string` |  Branch hash. |

**Returns:** `string`
Hex represntaton of the Base58-check branch hash.

___
<a id="writebufferwithhint"></a>

###  writeBufferWithHint

▸ **writeBufferWithHint**(b: *`string`*): `Buffer`

*Defined in [chain/tezos/TezosMessageUtil.ts:279](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L279)*

Writes an arbitrary Base58-check string into hex.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| b | `string` |  String to convert. |

**Returns:** `Buffer`

___
<a id="writeint"></a>

###  writeInt

▸ **writeInt**(value: *`number`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:36](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L36)*

Encodes an integer into hex after converting it to Zarith format.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| value | `number` |  Number to be obfuscated. |

**Returns:** `string`

___
<a id="writekeywithhint"></a>

###  writeKeyWithHint

▸ **writeKeyWithHint**(key: *`string`*, hint: *`string`*): `Buffer`

*Defined in [chain/tezos/TezosMessageUtil.ts:232](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L232)*

Writes a Base58-check key into hex.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| key | `string` |  Key to encode. |
| hint | `string` |  Key type, usually the curve it was generated from, eg: 'edsk'. |

**Returns:** `Buffer`

___
<a id="writepublickey"></a>

###  writePublicKey

▸ **writePublicKey**(publicKey: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageUtil.ts:196](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/chain/tezos/TezosMessageUtil.ts#L196)*

Encodes a public key in Base58-check into a hex string.

**Parameters:**

| Name | Type |
| ------ | ------ |
| publicKey | `string` |

**Returns:** `string`

___

