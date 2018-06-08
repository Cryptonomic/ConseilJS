import * as base58Check from 'bs58check'
import * as bip39 from 'bip39';
import * as sodium  from 'libsodium-wrappers';
import {KeyStore} from "../types/KeyStore";

/**
 * Cryptography helpers
 */

/**
 * Get byte prefix for Base58Check encoding and decoding of a given type of data.
 * @param {String} prefix   The type of data
 * @returns {Buffer}    Byte prefix
 */
export function getBase58BytesForPrefix(prefix: string): Buffer {
    switch(prefix)
    {
        case "tz1":
            return new Buffer([6, 161, 159]);
        case "edpk":
            return new Buffer([13, 15, 37, 217]);
        case "edsk":
            return new Buffer([43, 246, 78, 7]);
        case "edsig":
            return new Buffer([9, 245, 205, 134, 18]);
        case "op":
            return new Buffer([5, 116]);
        default:
            throw new RangeError("Unknown prefix");
    }
}

/**
 * Base58Check encodes a given binary payload using a given prefix.
 * @param {Buffer} payload  Binary payload
 * @param {String} prefix   Prefix
 * @returns {String}    Encoded string
 */
export function base58CheckEncode(payload: Buffer, prefix: string): string {
    const prefixBytes = getBase58BytesForPrefix(prefix);
    const prefixedPayload = Buffer.concat([prefixBytes, payload]);
    return base58Check.encode(prefixedPayload)
}

/**
 * Base58Check decodes a given binary payload using a given prefix.
 * @param {String} s    Base58Check-encoded string
 * @param {String} prefix   Prefix
 * @returns {Buffer}    Decoded bytes
 */
export function base58CheckDecode(s: string, prefix: string): Buffer {
    const prefixBytes = getBase58BytesForPrefix(prefix);
    const charsToSlice = prefixBytes.length;
    const decoded = base58Check.decode(s);
    return decoded.slice(charsToSlice)
}

/**
 * Generates keys from a user-supplied mnemonic and passphrase.
 * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
 * @param {string} passphrase   User-supplied passphrase
 * @returns {KeyStore}  Generated keys
 */
export function getKeysFromMnemonicAndPassphrase(mnemonic: string, passphrase: string): KeyStore {
    const seed = bip39.mnemonicToSeed(mnemonic, passphrase).slice(0, 32);
    const key_pair = sodium.crypto_sign_seed_keypair(seed);
    const privateKey = base58CheckEncode(key_pair.privateKey, "edsk");
    const publicKey = base58CheckEncode(key_pair.publicKey, "edpk");
    const publicKeyHash = base58CheckEncode(sodium.crypto_generichash(20, key_pair.publicKey), "tz1");
    return {
        publicKey: publicKey,
        privateKey: privateKey,
        publicKeyHash: publicKeyHash
    }
}

/**
 * Generates a new bip39 mnemonic
 * @returns {string}    Fifteen word mnemonic
 */
export function generateMnemonic(): string {
    return bip39.generateMnemonic(160)
}