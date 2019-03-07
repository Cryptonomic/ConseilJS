[conseiljs](../README.md) > [TezosMessageCodec](../modules/tezosmessagecodec.md)

# Module: TezosMessageCodec

## Index

### Functions

* [encodeReveal](tezosmessagecodec.md#encodereveal)
* [getOperationType](tezosmessagecodec.md#getoperationtype)
* [idFirstOperation](tezosmessagecodec.md#idfirstoperation)
* [parseDelegation](tezosmessagecodec.md#parsedelegation)
* [parseOperation](tezosmessagecodec.md#parseoperation)
* [parseOperationGroup](tezosmessagecodec.md#parseoperationgroup)
* [parseOrigination](tezosmessagecodec.md#parseorigination)
* [parseReveal](tezosmessagecodec.md#parsereveal)
* [parseTransaction](tezosmessagecodec.md#parsetransaction)

---

## Functions

<a id="encodereveal"></a>

###  encodeReveal

▸ **encodeReveal**(reveal: *[Operation](../interfaces/operation.md)*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:137](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosMessageCodec.ts#L137)*

Creates a hex string for the provided reveal operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| reveal | [Operation](../interfaces/operation.md) |  A reveal operation to be encoded. |

**Returns:** `string`

___
<a id="getoperationtype"></a>

###  getOperationType

▸ **getOperationType**(hex: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:23](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosMessageCodec.ts#L23)*

Parse operation type from a bounded hex string and translate to enum.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |   |

**Returns:** `string`

___
<a id="idfirstoperation"></a>

###  idFirstOperation

▸ **idFirstOperation**(hex: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:31](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosMessageCodec.ts#L31)*

Get OperationType of the first operation in the OperationGroup.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  Forged message in hex format. |

**Returns:** `string`

___
<a id="parsedelegation"></a>

###  parseDelegation

▸ **parseDelegation**(delegationMessage: *`string`*, isFirst?: *`boolean`*): `OperationEnvelope`

*Defined in [chain/tezos/TezosMessageCodec.ts:324](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosMessageCodec.ts#L324)*

Parse an delegation message possibly containing siblings.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| delegationMessage | `string` | - |  Encoded delegation-type message |
| `Default value` isFirst | `boolean` | true |  Flag to indicate first operation of Operation Group. |

**Returns:** `OperationEnvelope`

___
<a id="parseoperation"></a>

###  parseOperation

▸ **parseOperation**(hex: *`string`*, opType: *`string`*, isFirst?: *`boolean`*): `OperationEnvelope`

*Defined in [chain/tezos/TezosMessageCodec.ts:41](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosMessageCodec.ts#L41)*

Parse an operation of unknown length, possibly containing siblings.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| hex | `string` | - |  Encoded message. |
| opType | `string` | - |  Operation type to parse. |
| `Default value` isFirst | `boolean` | true |  Flag to indicate first operation of Operation Group. |

**Returns:** `OperationEnvelope`

___
<a id="parseoperationgroup"></a>

###  parseOperationGroup

▸ **parseOperationGroup**(hex: *`string`*): `Array`<[Operation](../interfaces/operation.md)>

*Defined in [chain/tezos/TezosMessageCodec.ts:392](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosMessageCodec.ts#L392)*

Parse an operation group

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  Encoded message stream. |

**Returns:** `Array`<[Operation](../interfaces/operation.md)>

___
<a id="parseorigination"></a>

###  parseOrigination

▸ **parseOrigination**(originationMessage: *`string`*, isFirst?: *`boolean`*): `OperationEnvelope`

*Defined in [chain/tezos/TezosMessageCodec.ts:231](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosMessageCodec.ts#L231)*

Parse an origination message possibly containing siblings.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| originationMessage | `string` | - |  Encoded origination-type message |
| `Default value` isFirst | `boolean` | true |  Flag to indicate first operation of Operation Group. |

**Returns:** `OperationEnvelope`

___
<a id="parsereveal"></a>

###  parseReveal

▸ **parseReveal**(revealMessage: *`string`*, isFirst?: *`boolean`*): `OperationEnvelope`

*Defined in [chain/tezos/TezosMessageCodec.ts:75](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosMessageCodec.ts#L75)*

Parse a reveal message possibly containing siblings.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| revealMessage | `string` | - |  Encoded reveal-type message |
| `Default value` isFirst | `boolean` | true |  Flag to indicate first operation of Operation Group. |

**Returns:** `OperationEnvelope`

___
<a id="parsetransaction"></a>

###  parseTransaction

▸ **parseTransaction**(transactionMessage: *`string`*, isFirst?: *`boolean`*): `OperationEnvelope`

*Defined in [chain/tezos/TezosMessageCodec.ts:157](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosMessageCodec.ts#L157)*

Parse a transaction message possibly containing siblings.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| transactionMessage | `string` | - |  Encoded transaction-type message |
| `Default value` isFirst | `boolean` | true |  Flag to indicate first operation of Operation Group. |

**Returns:** `OperationEnvelope`

___

