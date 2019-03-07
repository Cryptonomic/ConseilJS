[conseiljs](../README.md) > [TezosFileWallet](../modules/tezosfilewallet.md)

# Module: TezosFileWallet

Functions for Tezos file wallet functionality.

## Index

### Functions

* [createWallet](tezosfilewallet.md#createwallet)
* [loadWallet](tezosfilewallet.md#loadwallet)
* [saveWallet](tezosfilewallet.md#savewallet)

---

## Functions

<a id="createwallet"></a>

###  createWallet

▸ **createWallet**(filename: *`string`*, password: *`string`*): `Promise`<`any`>

*Defined in [identity/tezos/TezosFileWallet.ts:72](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/identity/tezos/TezosFileWallet.ts#L72)*

Creates a new wallet file.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| filename | `string` |  Where to save the wallet file |
| password | `string` |  User-supplied passphrase used to secure wallet file |

**Returns:** `Promise`<`any`>
Object corresponding to newly-created wallet

___
<a id="loadwallet"></a>

###  loadWallet

▸ **loadWallet**(filename: *`string`*, passphrase: *`string`*): `Promise`<[Wallet](../interfaces/wallet.md)>

*Defined in [identity/tezos/TezosFileWallet.ts:49](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/identity/tezos/TezosFileWallet.ts#L49)*

Loads a wallet from a given file.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| filename | `string` |  Name of file |
| passphrase | `string` |  User-supplied passphrase |

**Returns:** `Promise`<[Wallet](../interfaces/wallet.md)>
Loaded wallet

___
<a id="savewallet"></a>

###  saveWallet

▸ **saveWallet**(filename: *`string`*, wallet: *[Wallet](../interfaces/wallet.md)*, passphrase: *`string`*): `Promise`<[Wallet](../interfaces/wallet.md)>

*Defined in [identity/tezos/TezosFileWallet.ts:20](https://github.com/Cryptonomic/ConseilJS/blob/9f42371/src/identity/tezos/TezosFileWallet.ts#L20)*

Saves a wallet to a given file.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| filename | `string` |  Name of file |
| wallet | [Wallet](../interfaces/wallet.md) |  Wallet object |
| passphrase | `string` |  User-supplied passphrase |

**Returns:** `Promise`<[Wallet](../interfaces/wallet.md)>
Wallet object loaded from disk

___

