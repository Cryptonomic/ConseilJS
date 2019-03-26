[conseiljs](../README.md) > [DeviceSelector](../classes/deviceselector.md)

# Class: DeviceSelector

Ledger interface abstraction.

Rather than importing the ledger library directly the code that needs it will look it up here and only execute if it is indeed available. This is done in an effort to provide the ability to package different versions of ConseilJS, a light-weight one for web reporting tools like Arronax, a full version for nodejs-based use, etc.

## Hierarchy

**DeviceSelector**

## Index

### Properties

* [ledgerUtils](deviceselector.md#ledgerutils)

### Methods

* [getLedgerUtils](deviceselector.md#getledgerutils)
* [setLedgerUtils](deviceselector.md#setledgerutils)

---

## Properties

<a id="ledgerutils"></a>

### `<Static>` ledgerUtils

**● ledgerUtils**: *`any`* =  null

*Defined in [utils/DeviceSelector.ts:10](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/utils/DeviceSelector.ts#L10)*

___

## Methods

<a id="getledgerutils"></a>

### `<Static>` getLedgerUtils

▸ **getLedgerUtils**(): `any`

*Defined in [utils/DeviceSelector.ts:15](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/utils/DeviceSelector.ts#L15)*

**Returns:** `any`

___
<a id="setledgerutils"></a>

### `<Static>` setLedgerUtils

▸ **setLedgerUtils**(ledger: *`any`*): `void`

*Defined in [utils/DeviceSelector.ts:11](https://github.com/Cryptonomic/ConseilJS/blob/b4f6349/src/utils/DeviceSelector.ts#L11)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| ledger | `any` |

**Returns:** `void`

___

