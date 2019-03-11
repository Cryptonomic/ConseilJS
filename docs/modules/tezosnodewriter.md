[conseiljs](../README.md) > [TezosNodeWriter](../modules/tezosnodewriter.md)

# Module: TezosNodeWriter

Functions for sending operations on the Tezos network.

## Index

### Functions

* [appendRevealOperation](tezosnodewriter.md#appendrevealoperation)
* [applyOperation](tezosnodewriter.md#applyoperation)
* [forgeOperations](tezosnodewriter.md#forgeoperations)
* [injectOperation](tezosnodewriter.md#injectoperation)
* [sendAccountOriginationOperation](tezosnodewriter.md#sendaccountoriginationoperation)
* [sendContractInvocationOperation](tezosnodewriter.md#sendcontractinvocationoperation)
* [sendContractOriginationOperation](tezosnodewriter.md#sendcontractoriginationoperation)
* [sendDelegationOperation](tezosnodewriter.md#senddelegationoperation)
* [sendIdentityActivationOperation](tezosnodewriter.md#sendidentityactivationoperation)
* [sendKeyRevealOperation](tezosnodewriter.md#sendkeyrevealoperation)
* [sendOperation](tezosnodewriter.md#sendoperation)
* [sendTransactionOperation](tezosnodewriter.md#sendtransactionoperation)
* [signOperationGroup](tezosnodewriter.md#signoperationgroup)

---

## Functions

<a id="appendrevealoperation"></a>

###  appendRevealOperation

▸ **appendRevealOperation**(server: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, account: *[Account](../interfaces/account.md)*, operations: *[Operation](../interfaces/operation.md)[]*): `Promise`<[Operation](../interfaces/operation.md)[]>

*Defined in [chain/tezos/TezosNodeWriter.ts:193](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L193)*

Helper function for sending Delegations, Transactions, and Originations. Checks if manager's public key has been revealed for operation. If yes, do nothing, else, bundle a reveal operation before the input operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| account | [Account](../interfaces/account.md) |  Which account to use |
| operations | [Operation](../interfaces/operation.md)[] |  Delegation, Transaction, or Origination to possibly bundle with a reveal |

**Returns:** `Promise`<[Operation](../interfaces/operation.md)[]>

___
<a id="applyoperation"></a>

###  applyOperation

▸ **applyOperation**(server: *`string`*, blockHead: *[BlockMetadata](../interfaces/blockmetadata.md)*, operations: *`object`[]*, signedOpGroup: *[SignedOperationGroup](../interfaces/signedoperationgroup.md)*): `Promise`<[AlphaOperationsWithMetadata](../interfaces/alphaoperationswithmetadata.md)[]>

*Defined in [chain/tezos/TezosNodeWriter.ts:118](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L118)*

Applies an operation using the Tezos RPC client.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| blockHead | [BlockMetadata](../interfaces/blockmetadata.md) |  Block head |
| operations | `object`[] |  The operations to create and send |
| signedOpGroup | [SignedOperationGroup](../interfaces/signedoperationgroup.md) |  Signed operation group |

**Returns:** `Promise`<[AlphaOperationsWithMetadata](../interfaces/alphaoperationswithmetadata.md)[]>
Array of contract handles

___
<a id="forgeoperations"></a>

###  forgeOperations

▸ **forgeOperations**(blockHead: *[BlockMetadata](../interfaces/blockmetadata.md)*, operations: *`object`[]*): `string`

*Defined in [chain/tezos/TezosNodeWriter.ts:71](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L71)*

Forge an operation group.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| blockHead | [BlockMetadata](../interfaces/blockmetadata.md) |  The block head |
| operations | `object`[] |  The operations being forged as part of this operation group |

**Returns:** `string`
Forged operation bytes (as a hex string)

___
<a id="injectoperation"></a>

###  injectOperation

▸ **injectOperation**(server: *`string`*, signedOpGroup: *[SignedOperationGroup](../interfaces/signedoperationgroup.md)*): `Promise`<`string`>

*Defined in [chain/tezos/TezosNodeWriter.ts:157](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L157)*

Injects an operation using the Tezos RPC client.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| signedOpGroup | [SignedOperationGroup](../interfaces/signedoperationgroup.md) |  Signed operation group |

**Returns:** `Promise`<`string`>
ID of injected operation

___
<a id="sendaccountoriginationoperation"></a>

###  sendAccountOriginationOperation

▸ **sendAccountOriginationOperation**(server: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, amount: *`number`*, delegate: *`string`*, spendable: *`boolean`*, delegatable: *`boolean`*, fee: *`number`*, derivationPath: *`string`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:298](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L298)*

Sends an account origination operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| amount | `number` |  Initial funding amount of new account |
| delegate | `string` |  Account ID to delegate to, blank if none |
| spendable | `boolean` |  Is account spendable? |
| delegatable | `boolean` |  Is account delegatable? |
| fee | `number` |  Operation fee |
| derivationPath | `string` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>
Result of the operation

___
<a id="sendcontractinvocationoperation"></a>

###  sendContractInvocationOperation

▸ **sendContractInvocationOperation**(server: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, to: *`string`*, amount: *`number`*, fee: *`number`*, derivationPath: *`string`*, storageLimit: *`number`*, gasLimit: *`number`*, parameters: *`object`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:411](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L411)*

Invokes a contract with desired parameters

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  \- |
| keyStore | [KeyStore](../interfaces/keystore.md) |  \- |
| to | `string` |  \- |
| amount | `number` |  \- |
| fee | `number` |  \- |
| derivationPath | `string` |  \- |
| storageLimit | `number` |
| gasLimit | `number` |
| parameters | `object` |   |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>

___
<a id="sendcontractoriginationoperation"></a>

###  sendContractOriginationOperation

▸ **sendContractOriginationOperation**(server: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, amount: *`number`*, delegate: *`string`*, spendable: *`boolean`*, delegatable: *`boolean`*, fee: *`number`*, derivationPath: *`string`*, storage_limit: *`string`*, gas_limit: *`string`*, code: *`Array`<`object`>*, storage: *`object`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:327](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L327)*

Sends a contract origination operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| amount | `number` |  Initial funding amount of new account |
| delegate | `string` |  Account ID to delegate to, blank if none |
| spendable | `boolean` |  Is account spendable? |
| delegatable | `boolean` |  Is account delegatable? |
| fee | `number` |  Operation fee |
| derivationPath | `string` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |
| storage_limit | `string` |  Storage fee. |
| gas_limit | `string` |  Gas limit. |
| code | `Array`<`object`> |  Contract code. |
| storage | `object` |  Initial storage value. |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>

___
<a id="senddelegationoperation"></a>

###  sendDelegationOperation

▸ **sendDelegationOperation**(server: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, delegate: *`string`*, fee: *`number`*, derivationPath: *`string`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:262](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L262)*

Creates and sends a delegation operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| delegate | `string` |  Account ID to delegate to |
| fee | `number` |  Operation fee |
| derivationPath | `string` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>
Result of the operation

___
<a id="sendidentityactivationoperation"></a>

###  sendIdentityActivationOperation

▸ **sendIdentityActivationOperation**(server: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, activationCode: *`string`*, derivationPath: *`string`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:480](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L480)*

Creates and sends an activation operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| activationCode | `string` |  Activation code provided by fundraiser process |
| derivationPath | `string` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>
Result of the operation

___
<a id="sendkeyrevealoperation"></a>

###  sendKeyRevealOperation

▸ **sendKeyRevealOperation**(server: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, fee: *`number`*, derivationPath: *`string`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:450](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L450)*

Creates and sends a reveal operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| fee | `number` |  Fee to pay |
| derivationPath | `string` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>
Result of the operation

___
<a id="sendoperation"></a>

###  sendOperation

▸ **sendOperation**(server: *`string`*, operations: *`object`[]*, keyStore: *[KeyStore](../interfaces/keystore.md)*, derivationPath: *`any`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:173](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L173)*

Master function for creating and sending all supported types of operations.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| operations | `object`[] |  The operations to create and send |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| derivationPath | `any` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>
The ID of the created operation group

___
<a id="sendtransactionoperation"></a>

###  sendTransactionOperation

▸ **sendTransactionOperation**(server: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, to: *`string`*, amount: *`number`*, fee: *`number`*, derivationPath: *`string`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:225](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L225)*

Creates and sends a transaction operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| server | `string` |  Tezos node to connect to |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| to | `string` |  Destination public key hash |
| amount | `number` |  Amount to send |
| fee | `number` |  Fee to use |
| derivationPath | `string` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>
Result of the operation

___
<a id="signoperationgroup"></a>

###  signOperationGroup

▸ **signOperationGroup**(forgedOperation: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, derivationPath: *`string`*): `Promise`<[SignedOperationGroup](../interfaces/signedoperationgroup.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:41](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/chain/tezos/TezosNodeWriter.ts#L41)*

Signs a forged operation

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| forgedOperation | `string` |  Forged operation group returned by the Tezos client (as a hex string) |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| derivationPath | `string` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[SignedOperationGroup](../interfaces/signedoperationgroup.md)>
Bytes of the signed operation along with the actual signature

___

