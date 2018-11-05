/// <reference types="node" />
import { KeyStore, StoreType } from "../types/KeyStore";
import { Error } from "../types/Error";
/**
 * Cryptography helpers
 */
/**
 * Generates a salt for key derivation.
 * @returns {Buffer}    Salt
 */
export declare function generateSaltForPwHash(): Buffer;
/**
 * Encrypts a given message using a passphrase
 * @param {string} message  Message to encrypt
 * @param {string} passphrase   User-supplied passphrase
 * @param {Buffer} salt Salt for key derivation
 * @returns {Buffer}    Concatenated bytes of nonce and cipher text
 */
export declare function encryptMessage(message: string, passphrase: string, salt: Buffer): Buffer;
/**
 * Decrypts a given message using a passphrase
 * @param {Buffer} nonce_and_ciphertext Concatenated bytes of nonce and cipher text
 * @param {string} passphrase   User-supplied passphrase
 * @param {Buffer} salt Salt for key derivation
 * @returns {any}   Decrypted message
 */
export declare function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer): any;
/**
 * Get byte prefix for Base58Check encoding and decoding of a given type of data.
 * @param {String} prefix   The type of data
 * @returns {Buffer}    Byte prefix
 */
export declare function getBase58BytesForPrefix(prefix: string): Buffer;
/**
 * Base58Check encodes a given binary payload using a given prefix.
 * @param {Buffer} payload  Binary payload
 * @param {String} prefix   Prefix
 * @returns {String}    Encoded string
 */
export declare function base58CheckEncode(payload: Buffer, prefix: string): string;
/**
 * Base58Check decodes a given binary payload using a given prefix.
 * @param {String} s    Base58Check-encoded string
 * @param {String} prefix   Prefix
 * @returns {Buffer}    Decoded bytes
 */
export declare function base58CheckDecode(s: string, prefix: string): Buffer;
/**
 * Generates keys from a user-supplied mnemonic and passphrase.
 * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
 * @param {string} passphrase   User-supplied passphrase
 * @param {string} pkh  The public key hash supposedly produced by the given mnemonic and passphrase
 * @param {boolean} checkPKH Check whether presumed public key hash matches the actual public key hash
 * @param {StoreType} storeType   Type of the generated key store
 * @returns {KeyStore}  Generated keys
 */
export declare function getKeysFromMnemonicAndPassphrase(mnemonic: string, passphrase: string, pkh: string | undefined, checkPKH: boolean | undefined, storeType: StoreType): Error | KeyStore;
/**
 * Generates a new bip39 mnemonic
 * @returns {string}    Fifteen word mnemonic
 */
export declare function generateMnemonic(): string;
/**
 * Checking the password strength using zxcvbn
 * @returns {number}    Password score
 */
export declare function getPasswordStrength(password: string): number;
