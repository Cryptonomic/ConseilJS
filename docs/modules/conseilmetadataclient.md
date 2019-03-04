[conseiljs](../README.md) > [ConseilMetadataClient](../modules/conseilmetadataclient.md)

# Module: ConseilMetadataClient

Utility functions for querying backend Conseil v2 API for metadata

## Index

### Functions

* [executeMetadataQuery](conseilmetadataclient.md#executemetadataquery)
* [getAttributeValues](conseilmetadataclient.md#getattributevalues)
* [getAttributes](conseilmetadataclient.md#getattributes)
* [getEntities](conseilmetadataclient.md#getentities)
* [getNetworks](conseilmetadataclient.md#getnetworks)
* [getPlatforms](conseilmetadataclient.md#getplatforms)

---

## Functions

<a id="executemetadataquery"></a>

###  executeMetadataQuery

▸ **executeMetadataQuery**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, route: *`string`*): `Promise`<`any`>

*Defined in [reporting/ConseilMetadataClient.ts:11](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/reporting/ConseilMetadataClient.ts#L11)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |
| route | `string` |

**Returns:** `Promise`<`any`>

___
<a id="getattributevalues"></a>

###  getAttributeValues

▸ **getAttributeValues**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, platform: *`string`*, network: *`string`*, entity: *`string`*, attribute: *`string`*): `Promise`<`string`[]>

*Defined in [reporting/ConseilMetadataClient.ts:78](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/reporting/ConseilMetadataClient.ts#L78)*

Retrieves a list of distinct values for a specific attribute of an entity. This would work on low-cardinality, generally non-date and non-numeric data. The intended use-case for this result set is type-ahead auto-complete.

*__see__*: [getAttributes](conseilmetadataclient.md#getattributes)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| platform | `string` |  A platform |
| network | `string` |  A network |
| entity | `string` |  An entity |
| attribute | `string` |  Attribute of interest |

**Returns:** `Promise`<`string`[]>

___
<a id="getattributes"></a>

###  getAttributes

▸ **getAttributes**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, platform: *`string`*, network: *`string`*, entity: *`string`*): `Promise`<[AttributeDefinition](../interfaces/attributedefinition.md)[]>

*Defined in [reporting/ConseilMetadataClient.ts:63](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/reporting/ConseilMetadataClient.ts#L63)*

Retrieves a list of attributes for an entity.

*__see__*: [getEntities](conseilmetadataclient.md#getentities)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| platform | `string` |  A platform |
| network | `string` |  A network |
| entity | `string` |  Entity of interest |

**Returns:** `Promise`<[AttributeDefinition](../interfaces/attributedefinition.md)[]>

___
<a id="getentities"></a>

###  getEntities

▸ **getEntities**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, platform: *`string`*, network: *`string`*): `Promise`<[EntityDefinition](../interfaces/entitydefinition.md)[]>

*Defined in [reporting/ConseilMetadataClient.ts:49](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/reporting/ConseilMetadataClient.ts#L49)*

Retrieves a list of entities given a network, for example: 'block', 'operation', 'account'.

*__see__*: [getNetworks](conseilmetadataclient.md#getnetworks)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| platform | `string` |  A platform |
| network | `string` |  Network of interest |

**Returns:** `Promise`<[EntityDefinition](../interfaces/entitydefinition.md)[]>

___
<a id="getnetworks"></a>

###  getNetworks

▸ **getNetworks**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*, platform: *`string`*): `Promise`<[NetworkDefinition](../interfaces/networkdefinition.md)[]>

*Defined in [reporting/ConseilMetadataClient.ts:36](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/reporting/ConseilMetadataClient.ts#L36)*

Retrieves the list of available networks given a platform, for example: 'mainnet', 'alphanet', as is the case with tezos.

*__see__*: [getPlatforms](conseilmetadataclient.md#getplatforms)

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |  Conseil server connection definition. |
| platform | `string` |  Platform of interest |

**Returns:** `Promise`<[NetworkDefinition](../interfaces/networkdefinition.md)[]>

___
<a id="getplatforms"></a>

###  getPlatforms

▸ **getPlatforms**(serverInfo: *[ConseilServerInfo](../interfaces/conseilserverinfo.md)*): `Promise`<[PlatformDefinition](../interfaces/platformdefinition.md)[]>

*Defined in [reporting/ConseilMetadataClient.ts:24](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/reporting/ConseilMetadataClient.ts#L24)*

Retrieves the list of available platforms, for example: 'tezos'.

**Parameters:**

| Name | Type |
| ------ | ------ |
| serverInfo | [ConseilServerInfo](../interfaces/conseilserverinfo.md) |

**Returns:** `Promise`<[PlatformDefinition](../interfaces/platformdefinition.md)[]>

___

