[conseiljs](../README.md) > [TezosNodeWriter](../modules/tezosnodewriter.md)

# Module: TezosNodeWriter

Functions for sending operations on the Tezos network.

## Index

### Functions

* [appendRevealOperation](tezosnodewriter.md#appendrevealoperation)
* [applyOperation](tezosnodewriter.md#applyoperation)
* [forgeOperations](tezosnodewriter.md#forgeoperations)
* [injectOperation](tezosnodewriter.md#injectoperation)
* [isImplicitAndEmpty](tezosnodewriter.md#isimplicitandempty)
* [isManagerKeyRevealedForAccount](tezosnodewriter.md#ismanagerkeyrevealedforaccount)
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

▸ **appendRevealOperation**(network: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, account: *[Account](../interfaces/account.md)*, operations: *[Operation](../interfaces/operation.md)[]*): `Promise`<[Operation](../interfaces/operation.md)[]>

*Defined in [chain/tezos/TezosNodeWriter.ts:180](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L180)*

Helper function for sending Delegations, Transactions, and Originations. Checks if manager's public key has been revealed for operation. If yes, do nothing, else, bundle a reveal operation before the input operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| account | [Account](../interfaces/account.md) |  Which account to use |
| operations | [Operation](../interfaces/operation.md)[] |  Delegation, Transaction, or Origination to possibly bundle with a reveal |

**Returns:** `Promise`<[Operation](../interfaces/operation.md)[]>

___
<a id="applyoperation"></a>

###  applyOperation

▸ **applyOperation**(network: *`string`*, blockHead: *[BlockMetadata](../interfaces/blockmetadata.md)*, operations: *`object`[]*, signedOpGroup: *[SignedOperationGroup](../interfaces/signedoperationgroup.md)*): `Promise`<[AlphaOperationsWithMetadata](../interfaces/alphaoperationswithmetadata.md)[]>

*Defined in [chain/tezos/TezosNodeWriter.ts:102](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L102)*

Applies an operation using the Tezos RPC client.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
| blockHead | [BlockMetadata](../interfaces/blockmetadata.md) |  Block head |
| operations | `object`[] |  The operations to create and send |
| signedOpGroup | [SignedOperationGroup](../interfaces/signedoperationgroup.md) |  Signed operation group |

**Returns:** `Promise`<[AlphaOperationsWithMetadata](../interfaces/alphaoperationswithmetadata.md)[]>
Array of contract handles

___
<a id="forgeoperations"></a>

###  forgeOperations

▸ **forgeOperations**(network: *`string`*, blockHead: *[BlockMetadata](../interfaces/blockmetadata.md)*, operations: *`object`[]*): `Promise`<`string`>

*Defined in [chain/tezos/TezosNodeWriter.ts:57](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L57)*

Forge an operation group using the Tezos RPC client.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
| blockHead | [BlockMetadata](../interfaces/blockmetadata.md) |  The block head |
| operations | `object`[] |  The operations being forged as part of this operation group |

**Returns:** `Promise`<`string`>
Forged operation bytes (as a hex string)

___
<a id="injectoperation"></a>

###  injectOperation

▸ **injectOperation**(network: *`string`*, signedOpGroup: *[SignedOperationGroup](../interfaces/signedoperationgroup.md)*): `Promise`<`string`>

*Defined in [chain/tezos/TezosNodeWriter.ts:142](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L142)*

Injects an opertion using the Tezos RPC client.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
| signedOpGroup | [SignedOperationGroup](../interfaces/signedoperationgroup.md) |  Signed operation group |

**Returns:** `Promise`<`string`>
ID of injected operation

___
<a id="isimplicitandempty"></a>

###  isImplicitAndEmpty

▸ **isImplicitAndEmpty**(network: *`string`*, accountHash: *`string`*): `Promise`<`boolean`>

*Defined in [chain/tezos/TezosNodeWriter.ts:437](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L437)*

Indicates whether an account is implicit and empty. If true, transaction will burn 0.257tz.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
| accountHash | `string` |

**Returns:** `Promise`<`boolean`>
Result

___
<a id="ismanagerkeyrevealedforaccount"></a>

###  isManagerKeyRevealedForAccount

▸ **isManagerKeyRevealedForAccount**(network: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*): `Promise`<`boolean`>

*Defined in [chain/tezos/TezosNodeWriter.ts:454](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L454)*

Indicates whether a reveal operation has already been done for a given account.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |

**Returns:** `Promise`<`boolean`>
Result

___
<a id="sendaccountoriginationoperation"></a>

###  sendAccountOriginationOperation

▸ **sendAccountOriginationOperation**(network: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, amount: *`number`*, delegate: *`string`*, spendable: *`boolean`*, delegatable: *`boolean`*, fee: *`number`*, derivationPath: *`string`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:288](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L288)*

Sends an account origination operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
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

▸ **sendContractInvocationOperation**(network: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, to: *`string`*, amount: *`number`*, fee: *`number`*, derivationPath: *`string`*, storage_limit: *`string`*, gas_limit: *`string`*, parameters: *`object`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:401](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L401)*

Invokes a contract with desired parameters

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  \- |
| keyStore | [KeyStore](../interfaces/keystore.md) |  \- |
| to | `string` |  \- |
| amount | `number` |  \- |
| fee | `number` |  \- |
| derivationPath | `string` |  \- |
| storage_limit | `string` |  \- |
| gas_limit | `string` |  \- |
| parameters | `object` |   |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>

___
<a id="sendcontractoriginationoperation"></a>

###  sendContractOriginationOperation

▸ **sendContractOriginationOperation**(network: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, amount: *`number`*, delegate: *`string`*, spendable: *`boolean`*, delegatable: *`boolean`*, fee: *`number`*, derivationPath: *`string`*, storage_limit: *`string`*, gas_limit: *`string`*, code: *`Array`<`object`>*, storage: *`object`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:317](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L317)*

Sends a contract origination operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
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

▸ **sendDelegationOperation**(network: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, delegate: *`string`*, fee: *`number`*, derivationPath: *`string`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:252](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L252)*

Creates and sends a delegation operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| delegate | `string` |  Account ID to delegate to |
| fee | `number` |  Operation fee |
| derivationPath | `string` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>
Result of the operation

___
<a id="sendidentityactivationoperation"></a>

###  sendIdentityActivationOperation

▸ **sendIdentityActivationOperation**(network: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, activationCode: *`string`*, derivationPath: *`string`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:500](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L500)*

Creates and sends an activation operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| activationCode | `string` |  Activation code provided by fundraiser process |
| derivationPath | `string` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>
Result of the operation

___
<a id="sendkeyrevealoperation"></a>

###  sendKeyRevealOperation

▸ **sendKeyRevealOperation**(network: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, fee: *`number`*, derivationPath: *`string`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:470](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L470)*

Creates and sends a reveal operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| fee | `number` |  Fee to pay |
| derivationPath | `string` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>
Result of the operation

___
<a id="sendoperation"></a>

###  sendOperation

▸ **sendOperation**(network: *`string`*, operations: *`object`[]*, keyStore: *[KeyStore](../interfaces/keystore.md)*, derivationPath: *`any`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:154](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L154)*

Master function for creating and sending all supported types of operations.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
| operations | `object`[] |  The operations to create and send |
| keyStore | [KeyStore](../interfaces/keystore.md) |  Key pair along with public key hash |
| derivationPath | `any` |  BIP44 Derivation Path if signed with hardware, empty if signed with software |

**Returns:** `Promise`<[OperationResult](../interfaces/operationresult.md)>
The ID of the created operation group

___
<a id="sendtransactionoperation"></a>

###  sendTransactionOperation

▸ **sendTransactionOperation**(network: *`string`*, keyStore: *[KeyStore](../interfaces/keystore.md)*, to: *`string`*, amount: *`number`*, fee: *`number`*, derivationPath: *`string`*): `Promise`<[OperationResult](../interfaces/operationresult.md)>

*Defined in [chain/tezos/TezosNodeWriter.ts:216](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L216)*

Creates and sends a transaction operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| network | `string` |  Which Tezos network to go against |
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

*Defined in [chain/tezos/TezosNodeWriter.ts:24](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/chain/tezos/TezosNodeWriter.ts#L24)*

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

