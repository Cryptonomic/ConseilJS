"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base58Check = __importStar(require("bs58check"));
const bip39 = __importStar(require("bip39"));
const sodium = __importStar(require("libsodium-wrappers-sumo"));
const crypto = __importStar(require("crypto"));
const zxcvbn_1 = __importDefault(require("zxcvbn"));
/**
 * Cryptography helpers
 */
/**
 * Generates a salt for key derivation.
 * @returns {Buffer}    Salt
 */
function generateSaltForPwHash() {
    return crypto.randomBytes(sodium.crypto_pwhash_SALTBYTES);
}
exports.generateSaltForPwHash = generateSaltForPwHash;
/**
 * Encrypts a given message using a passphrase
 * @param {string} message  Message to encrypt
 * @param {string} passphrase   User-supplied passphrase
 * @param {Buffer} salt Salt for key derivation
 * @returns {Buffer}    Concatenated bytes of nonce and cipher text
 */
function encryptMessage(message, passphrase, salt) {
    const passwordStrength = getPasswordStrength(passphrase);
    if (passwordStrength < 3) {
        throw new Error('The password strength should not be less than 3.');
    }
    const messageBytes = sodium.from_string(message);
    const keyBytes = sodium.crypto_pwhash(sodium.crypto_box_SEEDBYTES, passphrase, salt, sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, sodium.crypto_pwhash_ALG_DEFAULT);
    const nonce = Buffer.from(sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES));
    const cipherText = Buffer.from(sodium.crypto_secretbox_easy(messageBytes, nonce, keyBytes));
    return Buffer.concat([nonce, cipherText]);
}
exports.encryptMessage = encryptMessage;
/**
 * Decrypts a given message using a passphrase
 * @param {Buffer} nonce_and_ciphertext Concatenated bytes of nonce and cipher text
 * @param {string} passphrase   User-supplied passphrase
 * @param {Buffer} salt Salt for key derivation
 * @returns {any}   Decrypted message
 */
function decryptMessage(nonce_and_ciphertext, passphrase, salt) {
    const keyBytes = sodium.crypto_pwhash(sodium.crypto_box_SEEDBYTES, passphrase, salt, sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE, sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE, sodium.crypto_pwhash_ALG_DEFAULT);
    if (nonce_and_ciphertext.length < sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES) {
        throw new Error("The cipher text is of insufficient length");
    }
    const nonce = nonce_and_ciphertext.slice(0, sodium.crypto_secretbox_NONCEBYTES);
    const ciphertext = nonce_and_ciphertext.slice(sodium.crypto_secretbox_NONCEBYTES);
    return sodium.crypto_secretbox_open_easy(ciphertext, nonce, keyBytes, 'text');
}
exports.decryptMessage = decryptMessage;
/**
 * Get byte prefix for Base58Check encoding and decoding of a given type of data.
 * @param {String} prefix   The type of data
 * @returns {Buffer}    Byte prefix
 */
function getBase58BytesForPrefix(prefix) {
    switch (prefix) {
        case "tz1":
            return Buffer.from([6, 161, 159]);
        case "edpk":
            return Buffer.from([13, 15, 37, 217]);
        case "edsk":
            return Buffer.from([43, 246, 78, 7]);
        case "edsig":
            return Buffer.from([9, 245, 205, 134, 18]);
        case "op":
            return Buffer.from([5, 116]);
        case "":
            return Buffer.from([]);
        default:
            throw new RangeError("Unknown prefix");
    }
}
exports.getBase58BytesForPrefix = getBase58BytesForPrefix;
/**
 * Base58Check encodes a given binary payload using a given prefix.
 * @param {Buffer} payload  Binary payload
 * @param {String} prefix   Prefix
 * @returns {String}    Encoded string
 */
function base58CheckEncode(payload, prefix) {
    const prefixBytes = getBase58BytesForPrefix(prefix);
    const bufPayload = Buffer.from(payload);
    const prefixedPayload = Buffer.concat([prefixBytes, bufPayload]);
    return base58Check.encode(prefixedPayload);
}
exports.base58CheckEncode = base58CheckEncode;
/**
 * Base58Check decodes a given binary payload using a given prefix.
 * @param {String} s    Base58Check-encoded string
 * @param {String} prefix   Prefix
 * @returns {Buffer}    Decoded bytes
 */
function base58CheckDecode(s, prefix) {
    const prefixBytes = getBase58BytesForPrefix(prefix);
    const charsToSlice = prefixBytes.length;
    const decoded = base58Check.decode(s);
    return decoded.slice(charsToSlice);
}
exports.base58CheckDecode = base58CheckDecode;
/**
 * Generates keys from a user-supplied mnemonic and passphrase.
 * @param {string} mnemonic Fifteen word mnemonic phrase from fundraiser PDF.
 * @param {string} passphrase   User-supplied passphrase
 * @param {string} pkh  The public key hash supposedly produced by the given mnemonic and passphrase
 * @param {boolean} checkPKH Check whether presumed public key hash matches the actual public key hash
 * @param {StoreType} storeType   Type of the generated key store
 * @returns {KeyStore}  Generated keys
 */
function getKeysFromMnemonicAndPassphrase(mnemonic, passphrase, pkh = '', checkPKH = true, storeType) {
    const lengthOfMnemonic = mnemonic.split(" ").length;
    if (lengthOfMnemonic !== 15)
        return { error: "The mnemonic should be 15 words." };
    if (!bip39.validateMnemonic(mnemonic))
        return { error: "The given mnemonic could not be validated." };
    const seed = bip39.mnemonicToSeed(mnemonic, passphrase).slice(0, 32);
    const nonce = "";
    const key_pair = sodium.crypto_sign_seed_keypair(seed, nonce);
    const privateKey = base58CheckEncode(key_pair.privateKey, "edsk");
    const publicKey = base58CheckEncode(key_pair.publicKey, "edpk");
    const publicKeyHash = base58CheckEncode(sodium.crypto_generichash(20, key_pair.publicKey), "tz1");
    if (checkPKH && publicKeyHash != pkh)
        return { error: "The given mnemonic and passphrase do not correspond to the applied public key hash" };
    return {
        publicKey,
        privateKey,
        publicKeyHash,
        seed,
        storeType
    };
}
exports.getKeysFromMnemonicAndPassphrase = getKeysFromMnemonicAndPassphrase;
/**
 * Generates a new bip39 mnemonic
 * @returns {string}    Fifteen word mnemonic
 */
function generateMnemonic() {
    return bip39.generateMnemonic(160);
}
exports.generateMnemonic = generateMnemonic;
/**
 * Checking the password strength using zxcvbn
 * @returns {number}    Password score
 */
function getPasswordStrength(password) {
    const results = zxcvbn_1.default(password);
    return results.score;
}
exports.getPasswordStrength = getPasswordStrength;
//# sourceMappingURL=CryptoUtils.js.map