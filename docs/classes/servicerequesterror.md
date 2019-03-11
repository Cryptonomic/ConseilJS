[conseiljs](../README.md) > [ServiceRequestError](../classes/servicerequesterror.md)

# Class: ServiceRequestError

Object to store details of an HTTP request failure. This would describe an error generated after sending a request, things that didn't result in a 200, or similarly "ok" status code.

## Hierarchy

 `Error`

**↳ ServiceRequestError**

↳  [ConseilRequestError](conseilrequesterror.md)

## Index

### Constructors

* [constructor](servicerequesterror.md#constructor)

### Properties

* [conseilURL](servicerequesterror.md#conseilurl)
* [data](servicerequesterror.md#data)
* [httpMessage](servicerequesterror.md#httpmessage)
* [httpStatus](servicerequesterror.md#httpstatus)
* [message](servicerequesterror.md#message)
* [name](servicerequesterror.md#name)
* [stack](servicerequesterror.md#stack)
* [Error](servicerequesterror.md#error)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new ServiceRequestError**(httpStatus: *`number`*, httpMessage: *`string`*, conseilURL: *`string`*, data: *`string` \| `null`*): [ServiceRequestError](servicerequesterror.md)

*Defined in [types/conseil/ErrorTypes.ts:10](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/types/conseil/ErrorTypes.ts#L10)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| httpStatus | `number` |
| httpMessage | `string` |
| conseilURL | `string` |
| data | `string` \| `null` |

**Returns:** [ServiceRequestError](servicerequesterror.md)

___

## Properties

<a id="conseilurl"></a>

###  conseilURL

**● conseilURL**: *`string`*

*Defined in [types/conseil/ErrorTypes.ts:9](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/types/conseil/ErrorTypes.ts#L9)*

___
<a id="data"></a>

###  data

**● data**: *`string` \| `null`*

*Defined in [types/conseil/ErrorTypes.ts:10](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/types/conseil/ErrorTypes.ts#L10)*

___
<a id="httpmessage"></a>

###  httpMessage

**● httpMessage**: *`string`*

*Defined in [types/conseil/ErrorTypes.ts:8](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/types/conseil/ErrorTypes.ts#L8)*

___
<a id="httpstatus"></a>

###  httpStatus

**● httpStatus**: *`number`*

*Defined in [types/conseil/ErrorTypes.ts:7](https://github.com/Cryptonomic/ConseilJS/blob/2dbb08e/src/types/conseil/ErrorTypes.ts#L7)*

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
<a id="error"></a>

### `<Static>` Error

**● Error**: *`ErrorConstructor`*

*Defined in /Users/cryptomike/Work/ConseilJS/governance/node_modules/typedoc/node_modules/typescript/lib/lib.es5.d.ts:974*

___

