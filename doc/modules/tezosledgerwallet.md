[conseiljs](../README.md) > [TezosLedgerWallet](../modules/tezosledgerwallet.md)

# Module: TezosLedgerWallet

## Index

### Functions

* [getTezosPublicKey](tezosledgerwallet.md#gettezospublickey)
* [initLedgerTransport](tezosledgerwallet.md#initledgertransport)
* [signTezosOperation](tezosledgerwallet.md#signtezosoperation)
* [unlockAddress](tezosledgerwallet.md#unlockaddress)

---

## Functions

<a id="gettezospublickey"></a>

###  getTezosPublicKey

▸ **getTezosPublicKey**(derivationPath: *`string`*): `Promise`<`string`>

*Defined in [identity/tezos/TezosLedgerWallet.ts:44](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/identity/tezos/TezosLedgerWallet.ts#L44)*

Given a BIP44 derivation path for Tezos, get the Tezos Public Key

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| derivationPath | `string` |  BIP44 Derivation Path |

**Returns:** `Promise`<`string`>

___
<a id="initledgertransport"></a>

###  initLedgerTransport

▸ **initLedgerTransport**(): `void`

*Defined in [identity/tezos/TezosLedgerWallet.ts:69](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/identity/tezos/TezosLedgerWallet.ts#L69)*

**Returns:** `void`

___
<a id="signtezosoperation"></a>

###  signTezosOperation

▸ **signTezosOperation**(derivationPath: *`string`*, watermarkedOpInHex: *`string`*): `Promise`<`Buffer`>

*Defined in [identity/tezos/TezosLedgerWallet.ts:59](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/identity/tezos/TezosLedgerWallet.ts#L59)*

Given a BIP44 derivation path for Tezos, and the hex encoded, watermarked Tezos Operation, sign using the ledger

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| derivationPath | `string` |  BIP44 Derivation Path |
| watermarkedOpInHex | `string` |  Operation |

**Returns:** `Promise`<`Buffer`>

___
<a id="unlockaddress"></a>

###  unlockAddress

▸ **unlockAddress**(deviceType: *[HardwareDeviceType](../enums/hardwaredevicetype.md)*, derivationPath: *`string`*): `Promise`<[KeyStore](../interfaces/keystore.md)>

*Defined in [identity/tezos/TezosLedgerWallet.ts:25](https://github.com/Cryptonomic/ConseilJS/blob/6ee1a2c/src/identity/tezos/TezosLedgerWallet.ts#L25)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| deviceType | [HardwareDeviceType](../enums/hardwaredevicetype.md) |
| derivationPath | `string` |

**Returns:** `Promise`<[KeyStore](../interfaces/keystore.md)>

___

