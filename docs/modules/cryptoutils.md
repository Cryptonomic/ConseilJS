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

▸ **decryptMessage**(nonce_and_ciphertext: *`Buffer`*, passphrase: *`string`*, salt: *`Buffer`*): `any`

*Defined in [utils/CryptoUtils.ts:52](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/utils/CryptoUtils.ts#L52)*

Decrypts a given message using a passphrase

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| nonce_and_ciphertext | `Buffer` |  Concatenated bytes of nonce and cipher text |
| passphrase | `string` |  User-supplied passphrase |
| salt | `Buffer` |  Salt for key derivation |

**Returns:** `any`
Decrypted message

___
<a id="encryptmessage"></a>

###  encryptMessage

▸ **encryptMessage**(message: *`string`*, passphrase: *`string`*, salt: *`Buffer`*): `Buffer`

*Defined in [utils/CryptoUtils.ts:25](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/utils/CryptoUtils.ts#L25)*

Encrypts a given message using a passphrase

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| message | `string` |  Message to encrypt |
| passphrase | `string` |  User-supplied passphrase |
| salt | `Buffer` |  Salt for key derivation |

**Returns:** `Buffer`
Concatenated bytes of nonce and cipher text

___
<a id="generatekeys"></a>

###  generateKeys

▸ **generateKeys**(seed: *`string`*): `object`

*Defined in [utils/CryptoUtils.ts:82](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/utils/CryptoUtils.ts#L82)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| seed | `string` |

**Returns:** `object`

___
<a id="generatesaltforpwhash"></a>

###  generateSaltForPwHash

▸ **generateSaltForPwHash**(): `Buffer`

*Defined in [utils/CryptoUtils.ts:14](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/utils/CryptoUtils.ts#L14)*

Generates a salt for key derivation.

**Returns:** `Buffer`
Salt

___
<a id="getpasswordstrength"></a>

###  getPasswordStrength

▸ **getPasswordStrength**(password: *`string`*): `number`

*Defined in [utils/CryptoUtils.ts:77](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/utils/CryptoUtils.ts#L77)*

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

▸ **signDetached**(payload: *`Buffer`*, privateKey: *`Buffer`*): `Buffer`

*Defined in [utils/CryptoUtils.ts:88](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/utils/CryptoUtils.ts#L88)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| payload | `Buffer` |
| privateKey | `Buffer` |

**Returns:** `Buffer`

___
<a id="simplehash"></a>

###  simpleHash

▸ **simpleHash**(payload: *`Buffer`*, length: *`number`*): `Buffer`

*Defined in [utils/CryptoUtils.ts:69](https://github.com/Cryptonomic/ConseilJS/blob/688e74f/src/utils/CryptoUtils.ts#L69)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| payload | `Buffer` |
| length | `number` |

**Returns:** `Buffer`

___

