[conseiljs](../README.md) > [TezosConseilClient](../modules/tezosconseilclient.md)

# Module: TezosConseilClient

Functions for querying the Conseil backend REST API v2 for Tezos chain data.

## Index

### Functions

* [getAccount](tezosconseilclient.md#getaccount)
* [getAccounts](tezosconseilclient.md#getaccounts)
* [getBlock](tezosconseilclient.md#getblock)
* [getBlockHead](tezosconseilclient.md#getblockhead)
* [getBlocks](tezosconseilclient.md#getblocks)
* [getFeeStatistics](tezosconseilclient.md#getfeestatistics)
* [getOperationGroup](tezosconseilclient.md#getoperationgroup)
* [getOperationGroups](tezosconseilclient.md#getoperationgroups)
* [getOperations](tezosconseilclient.md#getoperations)
* [getTezosEntityData](tezosconseilclient.md#gettezosentitydata)

---

## Functions

<a id="getaccount"></a>

###  getAccount

▸ **getAccount**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, accountID: *`string`*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:60](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/reporting/tezos/TezosConseilClient.ts#L60)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:101](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/reporting/tezos/TezosConseilClient.ts#L101)*

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
<a id="getblock"></a>

###  getBlock

▸ **getBlock**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, hash: *`string`*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:47](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/reporting/tezos/TezosConseilClient.ts#L47)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:34](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/reporting/tezos/TezosConseilClient.ts#L34)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:88](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/reporting/tezos/TezosConseilClient.ts#L88)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:138](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/reporting/tezos/TezosConseilClient.ts#L138)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:73](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/reporting/tezos/TezosConseilClient.ts#L73)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:114](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/reporting/tezos/TezosConseilClient.ts#L114)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:127](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/reporting/tezos/TezosConseilClient.ts#L127)*

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
<a id="gettezosentitydata"></a>

###  getTezosEntityData

▸ **getTezosEntityData**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, entity: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:24](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/reporting/tezos/TezosConseilClient.ts#L24)*

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

