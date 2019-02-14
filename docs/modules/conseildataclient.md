[conseiljs](../README.md) > [ConseilDataClient](../modules/conseildataclient.md)

# Module: ConseilDataClient

Utility functions for querying backend Conseil v2 API for metadata

## Index

### Functions

* [executeComplexQuery](conseildataclient.md#executecomplexquery)
* [executeEntityQuery](conseildataclient.md#executeentityquery)

---

## Functions

<a id="executecomplexquery"></a>

###  executeComplexQuery

▸ **executeComplexQuery**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, platform: *`string`*, network: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/ConseilDataClient.ts:49](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/reporting/ConseilDataClient.ts#L49)*

Requests data that may return result set composed of attributes of multiple entities.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| platform | `string` |  Platform to query, eg: Tezos. |
| network | `string` |  Network to query, eg: mainnet. |
| query | [ConseilQuery](../interfaces/conseilquery.md) |  JSON object confirming to the Conseil query spec. |

**Returns:** `Promise`<`any`[]>

___
<a id="executeentityquery"></a>

###  executeEntityQuery

▸ **executeEntityQuery**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, platform: *`string`*, network: *`string`*, entity: *`string`*, query: *[ConseilQuery](../interfaces/conseilquery.md)*): `Promise`<`any`[]>

*Defined in [reporting/ConseilDataClient.ts:20](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/reporting/ConseilDataClient.ts#L20)*

Requests data for a specific entity for a given platform/network combination, for example a block or an operation.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| platform | `string` |  Platform to query, eg: Tezos. |
| network | `string` |  Network to query, eg: mainnet. |
| entity | `string` |  Entity to query, eg: block, account, operation, etc. |
| query | [ConseilQuery](../interfaces/conseilquery.md) |  JSON object confirming to the Conseil query spec. |

**Returns:** `Promise`<`any`[]>

___

