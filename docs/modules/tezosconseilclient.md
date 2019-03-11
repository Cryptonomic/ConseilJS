[conseiljs](../README.md) > [TezosConseilClient](../modules/tezosconseilclient.md)

# Module: TezosConseilClient

Functions for querying the Conseil backend REST API v2 for Tezos chain data.

## Index

### Functions

* [getAccount](tezosconseilclient.md#getaccount)
* [getAccounts](tezosconseilclient.md#getaccounts)
* [getBakers](tezosconseilclient.md#getbakers)
* [getBallots](tezosconseilclient.md#getballots)
* [getBlock](tezosconseilclient.md#getblock)
* [getBlockHead](tezosconseilclient.md#getblockhead)
* [getBlocks](tezosconseilclient.md#getblocks)
* [getFeeStatistics](tezosconseilclient.md#getfeestatistics)
* [getOperationGroup](tezosconseilclient.md#getoperationgroup)
* [getOperationGroups](tezosconseilclient.md#getoperationgroups)
* [getOperations](tezosconseilclient.md#getoperations)
* [getProposals](tezosconseilclient.md#getproposals)
* [getTezosEntityData](tezosconseilclient.md#gettezosentitydata)

---

## Functions

<a id="getaccount"></a>

###  getAccount

▸ **getAccount**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, accountID: *`string`*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:63](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L63)*

Get an account from the Tezos platform given a network by account id.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| network | `string` |  Tezos network to query, mainnet, alphanet, etc. |
| accountID | `string` |  Account hash to query for. |

**Returns:** `Promise`<`any`[]>

___
<a id="getaccounts"></a>

###  getAccounts

▸ **getAccounts**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:104](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L104)*

Request account-entity data for a given network. Rather than simply requesting an account by hash, this function allows modification of the response to contain a subset of account attributes subject to a filter on some of them.

*__see__*: [Conseil Query Format Spec](https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| network | `string` |  Tezos network to query, mainnet, alphanet, etc. |
| query | [ConseilQuery](../interfaces/conseilquery.md) |  Conseil JSON query. See reference. |

**Returns:** `Promise`<`any`[]>

___
<a id="getbakers"></a>

###  getBakers

▸ **getBakers**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:154](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L154)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |
| network | `string` |
| query | [ConseilQuery](../interfaces/conseilquery.md) |

**Returns:** `Promise`<`any`[]>

___
<a id="getballots"></a>

###  getBallots

▸ **getBallots**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:158](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L158)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |
| network | `string` |
| query | [ConseilQuery](../interfaces/conseilquery.md) |

**Returns:** `Promise`<`any`[]>

___
<a id="getblock"></a>

###  getBlock

▸ **getBlock**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, hash: *`string`*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:50](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L50)*

Get a block by hash from the Tezos platform given a network.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| network | `string` |  Tezos network to query, mainnet, alphanet, etc. |
| hash | `string` |  Block hash to query for. |

**Returns:** `Promise`<`any`[]>

___
<a id="getblockhead"></a>

###  getBlockHead

▸ **getBlockHead**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:37](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L37)*

Get the head block from the Tezos platform given a network.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| network | `string` |  Tezos network to query, mainnet, alphanet, etc. |

**Returns:** `Promise`<`any`[]>

___
<a id="getblocks"></a>

###  getBlocks

▸ **getBlocks**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:91](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L91)*

Request block-entity data for a given network. Rather than simply requesting a block by hash, this function allows modification of the response to contain a subset of block attributes subject to a filter on some of them.

*__see__*: [Conseil Query Format Spec](https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| network | `string` |  Tezos network to query, mainnet, alphanet, etc. |
| query | [ConseilQuery](../interfaces/conseilquery.md) |  Conseil JSON query. See reference. |

**Returns:** `Promise`<`any`[]>

___
<a id="getfeestatistics"></a>

###  getFeeStatistics

▸ **getFeeStatistics**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, operationType: *[OperationKindType](../enums/operationkindtype.md)*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:141](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L141)*

Request pre-computed fee statistics for operation fees by operation kind. The query returns the latest record.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| network | `string` |  Tezos network to query, mainnet, alphanet, etc. |
| operationType | [OperationKindType](../enums/operationkindtype.md) |  Tezos operation kind |

**Returns:** `Promise`<`any`[]>

___
<a id="getoperationgroup"></a>

###  getOperationGroup

▸ **getOperationGroup**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, operationGroupID: *`string`*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:76](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L76)*

Get an operation group from the Tezos platform given a network by id.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| network | `string` |  Tezos network to query, mainnet, alphanet, etc. |
| operationGroupID | `string` |  Operation group hash to query for. |

**Returns:** `Promise`<`any`[]>

___
<a id="getoperationgroups"></a>

###  getOperationGroups

▸ **getOperationGroups**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:117](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L117)*

Request operation group-entity data for a given network. Rather than simply requesting an operation group by hash, this function allows modification of the response to contain a subset of operation group attributes subject to a filter on some of them.

*__see__*: [Conseil Query Format Spec](https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| network | `string` |  Tezos network to query, mainnet, alphanet, etc. |
| query | [ConseilQuery](../interfaces/conseilquery.md) |  Conseil JSON query. See reference. |

**Returns:** `Promise`<`any`[]>

___
<a id="getoperations"></a>

###  getOperations

▸ **getOperations**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:130](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L130)*

Request operation-entity data for a given network. This function allows modification of the response to contain a subset of operation attributes subject to a filter on some of them.

*__see__*: [Conseil Query Format Spec](https://github.com/Cryptonomic/Conseil/blob/master/doc/Query.md)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| network | `string` |  Tezos network to query, mainnet, alphanet, etc. |
| query | [ConseilQuery](../interfaces/conseilquery.md) |  Conseil JSON query. See reference. |

**Returns:** `Promise`<`any`[]>

___
<a id="getproposals"></a>

###  getProposals

▸ **getProposals**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:150](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L150)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |
| network | `string` |
| query | [ConseilQuery](../interfaces/conseilquery.md) |

**Returns:** `Promise`<`any`[]>

___
<a id="gettezosentitydata"></a>

###  getTezosEntityData

▸ **getTezosEntityData**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, entity: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:27](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/reporting/tezos/TezosConseilClient.ts#L27)*

Returns a record set for a specific entity of the Tezos platform. Entity list and metadata can be retrieved using ConseilMetadataClient.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| network | `string` |  Tezos network to query, mainnet, alphanet, etc. |
| entity | `string` |  Entity to retrieve. |
| query | [ConseilQuery](../interfaces/conseilquery.md) |  Query to submit. |

**Returns:** `Promise`<`any`[]>

___

