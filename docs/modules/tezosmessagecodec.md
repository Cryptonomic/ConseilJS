[conseiljs](../README.md) > [TezosMessageCodec](../modules/tezosmessagecodec.md)

# Module: TezosMessageCodec

## Index

### Functions

* [encodeActivation](tezosmessagecodec.md#encodeactivation)
* [encodeBallot](tezosmessagecodec.md#encodeballot)
* [encodeDelegation](tezosmessagecodec.md#encodedelegation)
* [encodeOperation](tezosmessagecodec.md#encodeoperation)
* [encodeOrigination](tezosmessagecodec.md#encodeorigination)
* [encodeReveal](tezosmessagecodec.md#encodereveal)
* [encodeTransaction](tezosmessagecodec.md#encodetransaction)
* [getOperationType](tezosmessagecodec.md#getoperationtype)
* [idFirstOperation](tezosmessagecodec.md#idfirstoperation)
* [parseBallot](tezosmessagecodec.md#parseballot)
* [parseDelegation](tezosmessagecodec.md#parsedelegation)
* [parseOperation](tezosmessagecodec.md#parseoperation)
* [parseOperationGroup](tezosmessagecodec.md#parseoperationgroup)
* [parseOrigination](tezosmessagecodec.md#parseorigination)
* [parseReveal](tezosmessagecodec.md#parsereveal)
* [parseTransaction](tezosmessagecodec.md#parsetransaction)

---

## Functions

<a id="encodeactivation"></a>

###  encodeActivation

▸ **encodeActivation**(activation: *[Activation](../interfaces/activation.md)*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:103](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L103)*

"Forges" Tezos P2P Activation message. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| activation | [Activation](../interfaces/activation.md) |  Message to encode |

**Returns:** `string`

___
<a id="encodeballot"></a>

###  encodeBallot

▸ **encodeBallot**(ballot: *[Ballot](../interfaces/ballot.md)*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:171](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L171)*

"Forges" Tezos P2P Ballot message. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| ballot | [Ballot](../interfaces/ballot.md) |  Message to encode |

**Returns:** `string`

___
<a id="encodedelegation"></a>

###  encodeDelegation

▸ **encodeDelegation**(delegation: *[Operation](../interfaces/operation.md)*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:568](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L568)*

"Forges" Tezos P2P Delegation message. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| delegation | [Operation](../interfaces/operation.md) |  Message to encode |

**Returns:** `string`

___
<a id="encodeoperation"></a>

###  encodeOperation

▸ **encodeOperation**(message: *`any`*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:78](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L78)*

"Forges" Tezos P2P messages.

**Parameters:**

| Name | Type |
| ------ | ------ |
| message | `any` |

**Returns:** `string`
Hex string of the message content

___
<a id="encodeorigination"></a>

###  encodeOrigination

▸ **encodeOrigination**(origination: *[Operation](../interfaces/operation.md)*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:466](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L466)*

"Forges" Tezos P2P Origination message. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| origination | [Operation](../interfaces/operation.md) |  Message to encode |

**Returns:** `string`

___
<a id="encodereveal"></a>

###  encodeReveal

▸ **encodeReveal**(reveal: *[Operation](../interfaces/operation.md)*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:250](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L250)*

Creates a hex string for the provided reveal operation. Note that to be sent to the node it will need to be added to an operation group or be prepended with a Branch.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| reveal | [Operation](../interfaces/operation.md) |  A reveal operation to be encoded. |

**Returns:** `string`

___
<a id="encodetransaction"></a>

###  encodeTransaction

▸ **encodeTransaction**(transaction: *[Operation](../interfaces/operation.md)*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:349](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L349)*

Encodes a Transaction operation.

*__todo__*: parameters field is not yet supported

*__see__*: [Tezos P2P message format](https://tezos.gitlab.io/mainnet/api/p2p.html#transaction-tag-8)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| transaction | [Operation](../interfaces/operation.md) |  \- |

**Returns:** `string`

___
<a id="getoperationtype"></a>

###  getOperationType

▸ **getOperationType**(hex: *`string`*): `string`

*Defined in [chain/tezos/TezosMessageCodec.ts:23](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L23)*

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

*Defined in [chain/tezos/TezosMessageCodec.ts:31](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L31)*

Get OperationType of the first operation in the OperationGroup.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  Forged message in hex format. |

**Returns:** `string`

___
<a id="parseballot"></a>

###  parseBallot

▸ **parseBallot**(ballotMessage: *`string`*, isFirst?: *`boolean`*): `OperationEnvelope`

*Defined in [chain/tezos/TezosMessageCodec.ts:117](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L117)*

Parse a Ballot, tag 6, message possibly containing siblings.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| ballotMessage | `string` | - |
| `Default value` isFirst | `boolean` | true |  Flag to indicate first operation of Operation Group. |

**Returns:** `OperationEnvelope`

___
<a id="parsedelegation"></a>

###  parseDelegation

▸ **parseDelegation**(delegationMessage: *`string`*, isFirst?: *`boolean`*): `OperationEnvelope`

*Defined in [chain/tezos/TezosMessageCodec.ts:499](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L499)*

Parse an Delegation, tag 10, message possibly containing siblings.

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

*Defined in [chain/tezos/TezosMessageCodec.ts:42](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L42)*

Parse an operation of unknown length, possibly containing siblings.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| hex | `string` | - |  Encoded message |
| opType | `string` | - |  Operation type to parse |
| `Default value` isFirst | `boolean` | true |  Flag to indicate first operation of Operation Group |

**Returns:** `OperationEnvelope`

___
<a id="parseoperationgroup"></a>

###  parseOperationGroup

▸ **parseOperationGroup**(hex: *`string`*): `Array`<`any`>

*Defined in [chain/tezos/TezosMessageCodec.ts:593](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L593)*

Parse an operation group.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  Encoded message stream |

**Returns:** `Array`<`any`>

___
<a id="parseorigination"></a>

###  parseOrigination

▸ **parseOrigination**(originationMessage: *`string`*, isFirst?: *`boolean`*): `OperationEnvelope`

*Defined in [chain/tezos/TezosMessageCodec.ts:373](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L373)*

Parse an Origination, tag 9, message possibly containing siblings.

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

*Defined in [chain/tezos/TezosMessageCodec.ts:187](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L187)*

Parse a Reveal, tag 7, message possibly containing siblings.

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

*Defined in [chain/tezos/TezosMessageCodec.ts:271](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/chain/tezos/TezosMessageCodec.ts#L271)*

Parse a Transaction, tag 8, message possibly containing siblings.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| transactionMessage | `string` | - |  Encoded transaction-type message |
| `Default value` isFirst | `boolean` | true |  Flag to indicate first operation of Operation Group. |

**Returns:** `OperationEnvelope`

___

