[conseiljs](../README.md) > [ServiceResponseError](../classes/serviceresponseerror.md)

# Class: ServiceResponseError

A container for response failures. Meaning a response was sent by the server, but there was some issue processing it after it was received.

## Hierarchy

 `Error`

**↳ ServiceResponseError**

↳  [ConseilResponseError](conseilresponseerror.md)

## Index

### Constructors

* [constructor](serviceresponseerror.md#constructor)

### Properties

* [conseilURL](serviceresponseerror.md#conseilurl)
* [data](serviceresponseerror.md#data)
* [httpMessage](serviceresponseerror.md#httpmessage)
* [httpStatus](serviceresponseerror.md#httpstatus)
* [message](serviceresponseerror.md#message)
* [name](serviceresponseerror.md#name)
* [response](serviceresponseerror.md#response)
* [stack](serviceresponseerror.md#stack)
* [Error](serviceresponseerror.md#error)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ServiceResponseError**(httpStatus: *`number`*, httpMessage: *`string`*, conseilURL: *`string`*, data: *`string` \| `null`*, response: *`any`*): [ServiceResponseError](serviceresponseerror.md)

*Defined in [types/conseil/ErrorTypes.ts:43](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L43)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| httpStatus | `number` |
| httpMessage | `string` |
| conseilURL | `string` |
| data | `string` \| `null` |
| response | `any` |

**Returns:** [ServiceResponseError](serviceresponseerror.md)

___

## Properties

<a id="conseilurl"></a>

###  conseilURL

**● conseilURL**: *`string`*

*Defined in [types/conseil/ErrorTypes.ts:41](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L41)*

___
<a id="data"></a>

###  data

**● data**: *`string` \| `null`*

*Defined in [types/conseil/ErrorTypes.ts:42](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L42)*

___
<a id="httpmessage"></a>

###  httpMessage

**● httpMessage**: *`string`*

*Defined in [types/conseil/ErrorTypes.ts:40](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L40)*

___
<a id="httpstatus"></a>

###  httpStatus

**● httpStatus**: *`number`*

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

*Defined in [types/conseil/ErrorTypes.ts:43](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/types/conseil/ErrorTypes.ts#L43)*

___
<a id="stack"></a>

### `<Optional>` stack

**● stack**: *`undefined` \| `string`*

*Inherited from Error.stack*

*Overrides Error.stack*

*Defined in /Users/cryptomike/Work/ConseilJS/docs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:965*

___
<a id="error"></a>

### `<Static>` Error

**● Error**: *`ErrorConstructor`*

*Defined in /Users/cryptomike/Work/ConseilJS/docs/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:974*

___

