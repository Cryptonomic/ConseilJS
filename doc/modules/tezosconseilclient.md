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
* [getOperationGroup](tezosconseilclient.md#getoperationgroup)
* [getOperationGroups](tezosconseilclient.md#getoperationgroups)
* [getOperations](tezosconseilclient.md#getoperations)
* [getTezosEntityData](tezosconseilclient.md#gettezosentitydata)

---

## Functions

<a id="getaccount"></a>

###  getAccount

▸ **getAccount**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, accountID: *`string`*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:58](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/tezos/TezosConseilClient.ts#L58)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:99](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/tezos/TezosConseilClient.ts#L99)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:45](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/tezos/TezosConseilClient.ts#L45)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:32](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/tezos/TezosConseilClient.ts#L32)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:86](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/tezos/TezosConseilClient.ts#L86)*

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
<a id="getoperationgroup"></a>

###  getOperationGroup

▸ **getOperationGroup**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, network: *`string`*, operationGroupID: *`string`*): `Promise`<`any`[]>

*Defined in [reporting/tezos/TezosConseilClient.ts:71](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/tezos/TezosConseilClient.ts#L71)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:112](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/tezos/TezosConseilClient.ts#L112)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:125](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/tezos/TezosConseilClient.ts#L125)*

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

*Defined in [reporting/tezos/TezosConseilClient.ts:22](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/reporting/tezos/TezosConseilClient.ts#L22)*

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

