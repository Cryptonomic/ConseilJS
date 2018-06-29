import * as base58Check from 'bs58check'
import * as bip39 from 'bip39';
import * as sodium  from 'libsodium-wrappers-sumo';
import {KeyStore} from "../types/KeyStore";
import {Error} from "../types/Error";
import * as crypto from 'crypto'

/**
 * Cryptography helpers
 */

/**
 * Generates a salt for key derivation.
 * @returns {Buffer}    Salt
 */
export function generateSaltForPwHash() {
    return crypto.randomBytes(sodium.crypto_pwhash_SALTBYTES)
}

/**
 * Encrypts a given message using a passphrase
 * @param {string} message  Message to encrypt
 * @param {string} passphrase   User-supplied passphrase
 * @param {Buffer} salt Salt for key derivation
 * @returns {Buffer}    Concatenated bytes of nonce and cipher text
 */
export function encryptMessage(message: string, passphrase: string, salt: Buffer) {
    const messageBytes = sodium.from_string(message);
    const keyBytes = sodium.crypto_pwhash(
        sodium.crypto_box_SEEDBYTES,
        passphrase,
        salt,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_DEFAULT
    );
    const nonce = Buffer.from(sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES));
    const cipherText = Buffer.from(sodium.crypto_secretbox_easy(messageBytes, nonce, keyBytes));
    return Buffer.concat([nonce, cipherText]);
}

/**
 * Decrypts a given message using a passphrase
 * @param {Buffer} nonce_and_ciphertext Concatenated bytes of nonce and cipher text
 * @param {string} passphrase   User-supplied passphrase
 * @param {Buffer} salt Salt for key derivation
 * @returns {any}   Decrypted message
 */
export function decryptMessage(nonce_and_ciphertext: Buffer, passphrase: string, salt: Buffer ) {
    const keyBytes = sodium.crypto_pwhash(
        sodium.crypto_box_SEEDBYTES,
        passphrase,
        salt,
        sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE,
        sodium.crypto_pwhash_ALG_DEFAULT
    );
    if (nonce_and_ciphertext.length < sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES) {
        throw "The cipher text is of insufficient length";
    }
    const nonce = nonce_and_ciphertext.slice(0, sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = nonce_and_ciphertext.slice(sodium.crypto_secretbox_NONCEBYTES);
    return sodium.crypto_secretbox_open_easy(ciphertext, nonce, keyBytes, 'text');
}

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
        case "":
            return new Buffer([]);
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
 * @param {string} pkh  The public key hash supposedly produced by the given mnemonic and passphrase
 * @param {string} checkPKH Check whether presumed public key hash matches the actual public key hash
 * @returns {KeyStore}  Generated keys
 */
export function getKeysFromMnemonicAndPassphrase(mnemonic: string, passphrase: string, pkh = '', checkPKH = true): Error | KeyStore {
    const lengthOfMnemonic = mnemonic.split(" ").length;
    if (lengthOfMnemonic !== 15) return {error: "The mnemonic should be 15 words."};
    const seed = bip39.mnemonicToSeed(mnemonic, passphrase).slice(0, 32);
    const key_pair = sodium.crypto_sign_seed_keypair(seed, "");
    const privateKey = base58CheckEncode(key_pair.privateKey, "edsk");
    const publicKey = base58CheckEncode(key_pair.publicKey, "edpk");
    const publicKeyHash = base58CheckEncode(sodium.crypto_generichash(20, key_pair.publicKey), "tz1");
    if(checkPKH && publicKeyHash != pkh) return {error: "The given mnemonic and passphrase do not correspond to the applied public key hash"};
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