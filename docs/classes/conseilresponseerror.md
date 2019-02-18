[conseiljs](../README.md) > [ConseilResponseError](../classes/conseilresponseerror.md)

# Class: ConseilResponseError

A specialization of ServiceResponseError for Conseil services.

## Hierarchy

↳  [ServiceResponseError](serviceresponseerror.md)

**↳ ConseilResponseError**

## Index

### Constructors

* [constructor](conseilresponseerror.md#constructor)

### Properties

* [conseilQuery](conseilresponseerror.md#conseilquery)
* [conseilURL](conseilresponseerror.md#conseilurl)
* [data](conseilresponseerror.md#data)
* [httpMessage](conseilresponseerror.md#httpmessage)
* [httpStatus](conseilresponseerror.md#httpstatus)
* [message](conseilresponseerror.md#message)
* [name](conseilresponseerror.md#name)
* [response](conseilresponseerror.md#response)
* [stack](conseilresponseerror.md#stack)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ConseilResponseError**(httpStatus: *`number`*, httpMessage: *`string`*, conseilURL: *`string`*, conseilQuery: *[ConseilQuery](../interfaces/conseilquery.md) \| `null`*, response: *`any`*): [ConseilResponseError](conseilresponseerror.md)

*Overrides [ServiceResponseError](serviceresponseerror.md).[constructor](serviceresponseerror.md#constructor)*

*Defined in [types/conseil/ErrorTypes.ts:60](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L60)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| httpStatus | `number` |
| httpMessage | `string` |
| conseilURL | `string` |
| conseilQuery | [ConseilQuery](../interfaces/conseilquery.md) \| `null` |
| response | `any` |

**Returns:** [ConseilResponseError](conseilresponseerror.md)

___

## Properties

<a id="conseilquery"></a>

###  conseilQuery

**● conseilQuery**: *[ConseilQuery](../interfaces/conseilquery.md) \| `null`*

*Defined in [types/conseil/ErrorTypes.ts:60](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L60)*

___
<a id="conseilurl"></a>

###  conseilURL

**● conseilURL**: *`string`*

*Inherited from [ServiceResponseError](serviceresponseerror.md).[conseilURL](serviceresponseerror.md#conseilurl)*

*Defined in [types/conseil/ErrorTypes.ts:41](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L41)*

___
<a id="data"></a>

###  data

**● data**: *`string` \| `null`*

*Inherited from [ServiceResponseError](serviceresponseerror.md).[data](serviceresponseerror.md#data)*

*Defined in [types/conseil/ErrorTypes.ts:42](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L42)*

___
<a id="httpmessage"></a>

###  httpMessage

**● httpMessage**: *`string`*

*Inherited from [ServiceResponseError](serviceresponseerror.md).[httpMessage](serviceresponseerror.md#httpmessage)*

*Defined in [types/conseil/ErrorTypes.ts:40](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L40)*

___
<a id="httpstatus"></a>

###  httpStatus

**● httpStatus**: *`number`*

*Inherited from [ServiceResponseError](serviceresponseerror.md).[httpStatus](serviceresponseerror.md#httpstatus)*

*Defined in [types/conseil/ErrorTypes.ts:39](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L39)*

___
<a id="message"></a>

###  message

**● message**: *`string`*

*Inherited from Error.message*

*Defined in /Users/cryptomike/Work/ConseilJS/docs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:964*

___
<a id="name"></a>

###  name

**● name**: *`string`*

*Inherited from Error.name*

*Defined in /Users/cryptomike/Work/ConseilJS/docs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:963*

___
<a id="response"></a>

###  response

**● response**: *`any`*

*Inherited from [ServiceResponseError](serviceresponseerror.md).[response](serviceresponseerror.md#response)*

*Defined in [types/conseil/ErrorTypes.ts:43](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L43)*

___
<a id="stack"></a>

### `<Optional>` stack

**● stack**: *`undefined` \| `string`*

*Inherited from Error.stack*

*Overrides Error.stack*

*Defined in /Users/cryptomike/Work/ConseilJS/docs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:965*

___

