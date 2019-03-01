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

*Defined in [identity/tezos/TezosWalletUtil.ts:24](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/identity/tezos/TezosWalletUtil.ts#L24)*

Generates a fifteen word mnemonic phrase using the BIP39 standard.

**Returns:** `string`

___
<a id="getkeysfrommnemonicandpassphrase"></a>

###  getKeysFromMnemonicAndPassphrase

▸ **getKeysFromMnemonicAndPassphrase**(mnemonic: *`string`*, passphrase: *`string`*, pkh?: *`string`*, checkPKH?: *`boolean`*, storeType: *[StoreType](../enums/storetype.md)*): `Promise`<[KeyStore](../interfaces/keystore.md)>

*Defined in [identity/tezos/TezosWalletUtil.ts:49](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/identity/tezos/TezosWalletUtil.ts#L49)*

Generates keys from a user-supplied mnemonic and passphrase.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| mnemonic | `string` | - |  Fifteen word mnemonic phrase from fundraiser PDF. |
| passphrase | `string` | - |  User-supplied passphrase |
| `Default value` pkh | `string` | &quot;&quot; |  The public key hash supposedly produced by the given mnemonic and passphrase |
| `Default value` checkPKH | `boolean` | true |  Check whether presumed public key hash matches the actual public key hash |
| storeType | [StoreType](../enums/storetype.md) | - |  Type of the generated key store |

**Returns:** `Promise`<[KeyStore](../interfaces/keystore.md)>
Generated keys

___
<a id="unlockfundraiseridentity"></a>

###  unlockFundraiserIdentity

▸ **unlockFundraiserIdentity**(mnemonic: *`string`*, email: *`string`*, password: *`string`*, pkh: *`string`*): `Promise`<[KeyStore](../interfaces/keystore.md)>

*Defined in [identity/tezos/TezosWalletUtil.ts:17](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/identity/tezos/TezosWalletUtil.ts#L17)*

Unlocks an identity supplied during the 2017 Tezos fundraiser.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| mnemonic | `string` |  Fifteen word mnemonic phrase from fundraiser PDF. |
| email | `string` |  Email address from fundraiser PDF. |
| password | `string` |  Password from fundraiser PDF. |
| pkh | `string` |  The public key hash supposedly produced by the given mnemonic and passphrase |

**Returns:** `Promise`<[KeyStore](../interfaces/keystore.md)>
Wallet file

___
<a id="unlockidentitywithmnemonic"></a>

###  unlockIdentityWithMnemonic

▸ **unlockIdentityWithMnemonic**(mnemonic: *`string`*, passphrase: *`string`*): `Promise`<[KeyStore](../interfaces/keystore.md)>

*Defined in [identity/tezos/TezosWalletUtil.ts:35](https://github.com/Cryptonomic/ConseilJS/blob/9d6b05b/src/identity/tezos/TezosWalletUtil.ts#L35)*

Generates a key pair based on a mnemonic.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| mnemonic | `string` |  Fifteen word memonic phrase |
| passphrase | `string` |  User-supplied passphrase |

**Returns:** `Promise`<[KeyStore](../interfaces/keystore.md)>
Unlocked key pair

___

