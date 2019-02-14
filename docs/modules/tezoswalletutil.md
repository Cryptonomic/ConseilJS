[conseiljs](../README.md) > [TezosWalletUtil](../modules/tezoswalletutil.md)

# Module: TezosWalletUtil

## Index

### Functions

* [generateMnemonic](tezoswalletutil.md#generatemnemonic)
* [getKeysFromMnemonicAndPassphrase](tezoswalletutil.md#getkeysfrommnemonicandpassphrase)
* [unlockFundraiserIdentity](tezoswalletutil.md#unlockfundraiseridentity)
* [unlockIdentityWithMnemonic](tezoswalletutil.md#unlockidentitywithmnemonic)

---

## Functions

<a id="generatemnemonic"></a>

###  generateMnemonic

▸ **generateMnemonic**(): `string`

*Defined in [identity/tezos/TezosWalletUtil.ts:30](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/identity/tezos/TezosWalletUtil.ts#L30)*

Generates a fifteen word mnemonic phrase using the BIP39 standard.

**Returns:** `string`

___
<a id="getkeysfrommnemonicandpassphrase"></a>

###  getKeysFromMnemonicAndPassphrase

▸ **getKeysFromMnemonicAndPassphrase**(mnemonic: *`string`*, passphrase: *`string`*, pkh?: *`string`*, checkPKH?: *`boolean`*, storeType: *[StoreType](../enums/storetype.md)*): [Error](../interfaces/error.md) \| [KeyStore](../interfaces/keystore.md)

*Defined in [identity/tezos/TezosWalletUtil.ts:60](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/identity/tezos/TezosWalletUtil.ts#L60)*

Generates keys from a user-supplied mnemonic and passphrase.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| mnemonic | `string` | - |  Fifteen word mnemonic phrase from fundraiser PDF. |
| passphrase | `string` | - |  User-supplied passphrase |
| `Default value` pkh | `string` | &quot;&quot; |  The public key hash supposedly produced by the given mnemonic and passphrase |
| `Default value` checkPKH | `boolean` | true |  Check whether presumed public key hash matches the actual public key hash |
| storeType | [StoreType](../enums/storetype.md) | - |  Type of the generated key store |

**Returns:** [Error](../interfaces/error.md) \| [KeyStore](../interfaces/keystore.md)
Generated keys

___
<a id="unlockfundraiseridentity"></a>

###  unlockFundraiserIdentity

▸ **unlockFundraiserIdentity**(mnemonic: *`string`*, email: *`string`*, password: *`string`*, pkh: *`string`*): [KeyStore](../interfaces/keystore.md) \| [Error](../interfaces/error.md)

*Defined in [identity/tezos/TezosWalletUtil.ts:18](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/identity/tezos/TezosWalletUtil.ts#L18)*

Unlocks an identity supplied during the 2017 Tezos fundraiser.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| mnemonic | `string` |  Fifteen word mnemonic phrase from fundraiser PDF. |
| email | `string` |  Email address from fundraiser PDF. |
| password | `string` |  Password from fundraiser PDF. |
| pkh | `string` |  The public key hash supposedly produced by the given mnemonic and passphrase |

**Returns:** [KeyStore](../interfaces/keystore.md) \| [Error](../interfaces/error.md)
Wallet file

___
<a id="unlockidentitywithmnemonic"></a>

###  unlockIdentityWithMnemonic

▸ **unlockIdentityWithMnemonic**(mnemonic: *`string`*, passphrase: *`string`*): [KeyStore](../interfaces/keystore.md) \| [Error](../interfaces/error.md)

*Defined in [identity/tezos/TezosWalletUtil.ts:41](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/identity/tezos/TezosWalletUtil.ts#L41)*

Generates a key pair based on a mnemonic.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| mnemonic | `string` |  Fifteen word memonic phrase |
| passphrase | `string` |  User-supplied passphrase |

**Returns:** [KeyStore](../interfaces/keystore.md) \| [Error](../interfaces/error.md)
Unlocked key pair

___

