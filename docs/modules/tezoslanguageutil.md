[conseiljs](../README.md) > [TezosLanguageUtil](../modules/tezoslanguageutil.md)

# Module: TezosLanguageUtil

A collection of functions to encode and decode Michelson and Micheline code

## Index

### Functions

* [hexToMicheline](tezoslanguageutil.md#hextomicheline)
* [translateMichelineToHex](tezoslanguageutil.md#translatemichelinetohex)
* [translateMichelsonToHex](tezoslanguageutil.md#translatemichelsontohex)
* [translateMichelsonToMicheline](tezoslanguageutil.md#translatemichelsontomicheline)

---

## Functions

<a id="hextomicheline"></a>

###  hexToMicheline

▸ **hexToMicheline**(hex: *`string`*): `codeEnvelope`

*Defined in [chain/tezos/TezosLanguageUtil.ts:19](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/chain/tezos/TezosLanguageUtil.ts#L19)*

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| hex | `string` |  \- |

**Returns:** `codeEnvelope`
xxx

___
<a id="translatemichelinetohex"></a>

###  translateMichelineToHex

▸ **translateMichelineToHex**(code: *`string`*): `string`

*Defined in [chain/tezos/TezosLanguageUtil.ts:176](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/chain/tezos/TezosLanguageUtil.ts#L176)*

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  \- |

**Returns:** `string`
xxx

___
<a id="translatemichelsontohex"></a>

###  translateMichelsonToHex

▸ **translateMichelsonToHex**(code: *`string`*): `string`

*Defined in [chain/tezos/TezosLanguageUtil.ts:167](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/chain/tezos/TezosLanguageUtil.ts#L167)*

Convenience function to take Michelson code straight to hex, calls translateMichelsonToMicheline() then translateMichelineToHex() internally.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  Michelson code string |

**Returns:** `string`
hex-encoded contract content

___
<a id="translatemichelsontomicheline"></a>

###  translateMichelsonToMicheline

▸ **translateMichelsonToMicheline**(code: *`string`*): `string`

*Defined in [chain/tezos/TezosLanguageUtil.ts:155](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/chain/tezos/TezosLanguageUtil.ts#L155)*

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| code | `string` |  \- |

**Returns:** `string`
xxx

___

