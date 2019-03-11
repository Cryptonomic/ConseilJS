[conseiljs](../README.md) > [CryptoUtils](../modules/cryptoutils.md)

# Module: CryptoUtils

Cryptography helpers

## Index

### Functions

* [decryptMessage](cryptoutils.md#decryptmessage)
* [encryptMessage](cryptoutils.md#encryptmessage)
* [generateKeys](cryptoutils.md#generatekeys)
* [generateSaltForPwHash](cryptoutils.md#generatesaltforpwhash)
* [getPasswordStrength](cryptoutils.md#getpasswordstrength)
* [signDetached](cryptoutils.md#signdetached)
* [simpleHash](cryptoutils.md#simplehash)

---

## Functions

<a id="decryptmessage"></a>

###  decryptMessage

▸ **decryptMessage**(nonce_and_ciphertext: *`Buffer`*, passphrase: *`string`*, salt: *`Buffer`*): `Promise`<`string`>

*Defined in [utils/CryptoUtils.ts:46](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/utils/CryptoUtils.ts#L46)*

Decrypts a given message using a passphrase

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| nonce_and_ciphertext | `Buffer` |  Concatenated bytes of nonce and cipher text |
| passphrase | `string` |  User-supplied passphrase |
| salt | `Buffer` |  Salt for key derivation |

**Returns:** `Promise`<`string`>
Decrypted message

___
<a id="encryptmessage"></a>

###  encryptMessage

▸ **encryptMessage**(message: *`string`*, passphrase: *`string`*, salt: *`Buffer`*): `Promise`<`Buffer`>

*Defined in [utils/CryptoUtils.ts:25](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/utils/CryptoUtils.ts#L25)*

Encrypts a given message using a passphrase

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| message | `string` |  Message to encrypt |
| passphrase | `string` |  User-supplied passphrase |
| salt | `Buffer` |  Salt for key derivation |

**Returns:** `Promise`<`Buffer`>
Concatenated bytes of nonce and cipher text

___
<a id="generatekeys"></a>

###  generateKeys

▸ **generateKeys**(seed: *`string`*): `Promise`<`object`>

*Defined in [utils/CryptoUtils.ts:68](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/utils/CryptoUtils.ts#L68)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| seed | `string` |

**Returns:** `Promise`<`object`>

___
<a id="generatesaltforpwhash"></a>

###  generateSaltForPwHash

▸ **generateSaltForPwHash**(): `Promise`<`Buffer`>

*Defined in [utils/CryptoUtils.ts:13](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/utils/CryptoUtils.ts#L13)*

Generates a salt for key derivation.

**Returns:** `Promise`<`Buffer`>
Salt

___
<a id="getpasswordstrength"></a>

###  getPasswordStrength

▸ **getPasswordStrength**(password: *`string`*): `number`

*Defined in [utils/CryptoUtils.ts:63](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/utils/CryptoUtils.ts#L63)*

Checking the password strength using zxcvbn

**Parameters:**

| Name | Type |
| ------ | ------ |
| password | `string` |

**Returns:** `number`
Password score

___
<a id="signdetached"></a>

###  signDetached

▸ **signDetached**(payload: *`Buffer`*, secretKey: *`Buffer`*): `Promise`<`Buffer`>

*Defined in [utils/CryptoUtils.ts:74](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/utils/CryptoUtils.ts#L74)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| payload | `Buffer` |
| secretKey | `Buffer` |

**Returns:** `Promise`<`Buffer`>

___
<a id="simplehash"></a>

###  simpleHash

▸ **simpleHash**(payload: *`Buffer`*, length: *`number`*): `Buffer`

*Defined in [utils/CryptoUtils.ts:55](https://github.com/Cryptonomic/ConseilJS/blob/9065a8e/src/utils/CryptoUtils.ts#L55)*

Computes a BLAKE2b message hash of the requested length.

**Parameters:**

| Name | Type |
| ------ | ------ |
| payload | `Buffer` |
| length | `number` |

**Returns:** `Buffer`

___

