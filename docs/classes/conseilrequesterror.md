[conseiljs](../README.md) > [ConseilRequestError](../classes/conseilrequesterror.md)

# Class: ConseilRequestError

A specialization of ServiceRequestError for Conseil service requests.

## Hierarchy

↳  [ServiceRequestError](servicerequesterror.md)

**↳ ConseilRequestError**

## Index

### Constructors

* [constructor](conseilrequesterror.md#constructor)

### Properties

* [conseilQuery](conseilrequesterror.md#conseilquery)
* [conseilURL](conseilrequesterror.md#conseilurl)
* [data](conseilrequesterror.md#data)
* [httpMessage](conseilrequesterror.md#httpmessage)
* [httpStatus](conseilrequesterror.md#httpstatus)
* [message](conseilrequesterror.md#message)
* [name](conseilrequesterror.md#name)
* [stack](conseilrequesterror.md#stack)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ConseilRequestError**(httpStatus: *`number`*, httpMessage: *`string`*, conseilURL: *`string`*, conseilQuery: *[ConseilQuery](../interfaces/conseilquery.md) \| `null`*): [ConseilRequestError](conseilrequesterror.md)

*Overrides [ServiceRequestError](servicerequesterror.md).[constructor](servicerequesterror.md#constructor)*

*Defined in [types/conseil/ErrorTypes.ts:26](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/types/conseil/ErrorTypes.ts#L26)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| httpStatus | `number` |
| httpMessage | `string` |
| conseilURL | `string` |
| conseilQuery | [ConseilQuery](../interfaces/conseilquery.md) \| `null` |

**Returns:** [ConseilRequestError](conseilrequesterror.md)

___

## Properties

<a id="conseilquery"></a>

###  conseilQuery

**● conseilQuery**: *[ConseilQuery](../interfaces/conseilquery.md) \| `null`*

*Defined in [types/conseil/ErrorTypes.ts:26](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/types/conseil/ErrorTypes.ts#L26)*

___
<a id="conseilurl"></a>

###  conseilURL

**● conseilURL**: *`string`*

*Inherited from [ServiceRequestError](servicerequesterror.md).[conseilURL](servicerequesterror.md#conseilurl)*

*Defined in [types/conseil/ErrorTypes.ts:9](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/types/conseil/ErrorTypes.ts#L9)*

___
<a id="data"></a>

###  data

**● data**: *`string` \| `null`*

*Inherited from [ServiceRequestError](servicerequesterror.md).[data](servicerequesterror.md#data)*

*Defined in [types/conseil/ErrorTypes.ts:10](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/types/conseil/ErrorTypes.ts#L10)*

___
<a id="httpmessage"></a>

###  httpMessage

**● httpMessage**: *`string`*

*Inherited from [ServiceRequestError](servicerequesterror.md).[httpMessage](servicerequesterror.md#httpmessage)*

*Defined in [types/conseil/ErrorTypes.ts:8](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/types/conseil/ErrorTypes.ts#L8)*

___
<a id="httpstatus"></a>

###  httpStatus

**● httpStatus**: *`number`*

*Inherited from [ServiceRequestError](servicerequesterror.md).[httpStatus](servicerequesterror.md#httpstatus)*

*Defined in [types/conseil/ErrorTypes.ts:7](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/types/conseil/ErrorTypes.ts#L7)*

___
<a id="message"></a>

###  message

**● message**: *`string`*

*Inherited from Error.message*

*Defined in /Users/cryptomike/Work/ConseilJS/governance/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:964*

___
<a id="name"></a>

###  name

**● name**: *`string`*

*Inherited from Error.name*

*Defined in /Users/cryptomike/Work/ConseilJS/governance/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:963*

___
<a id="stack"></a>

### `<Optional>` stack

**● stack**: *`undefined` \| `string`*

*Inherited from Error.stack*

*Overrides Error.stack*

*Defined in /Users/cryptomike/Work/ConseilJS/governance/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:965*

___

